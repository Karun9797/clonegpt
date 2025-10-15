import axios from 'axios';
import Chat from '../models/chat.js';
import User from '../models/users.js';
import imagekit from '../configs/imagekit.js';
import openai from '../configs/openai.js';

export const textMessageController = async (request, response) => {
  try {
    const userId = request.user._id;
    const { chatId, prompt } = request.body;

    if (!prompt || !prompt.trim()) {
      return response.json({ success: false, message: 'Prompt cannot be empty' });
    }

    if (request.user.credits < 1) {
      return response.json({
        success: false,
        message: "You don't have enough credit to generate response.",
      });
    }

    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      return response.json({ success: false, message: 'Chat not found' });
    }

    // Push user message
    chat.messages.push({
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    // OpenAI request
    const { choices } = await openai.chat.completions.create({
      model: 'gemini-2.0-flash',
      messages: [{ role: 'user', content: prompt }],
    });

    const reply = { ...choices[0].message, timestamp: Date.now(), isImage: false };

    // Push AI reply
    chat.messages.push(reply);

    // Save chat and deduct credit
    await Promise.all([chat.save(), User.updateOne({ _id: userId }, { $inc: { credits: -1 } })]);

    // Send response AFTER everything is done
    return response.json({ success: true, reply });
  } catch (error) {
    console.error(error);
    return response.json({ success: false, message: error.message });
  }
};

// image generation message controller
export const imageMessageController = async (request, response) => {
  try {
    const userId = request.user._id;

    // checks credits
    if (request.user.credits < 2) {
      return response.json({
        success: false,
        message: "You don't have enough credit to generate image.",
      });
    }
    const { prompt, chatId, isPublished } = request.body;

    // Find chat
    const chat = await Chat.findOne({ userId, _id: chatId });

    chat.messages.push({ role: 'user', content: prompt, timestamp: Date.now(), isImage: false });

    //encode the prompt
    const encodedPrompt = encodeURIComponent(prompt);

    // construct imagekit ai generation url
    const generatedImageUrl = `${
      process.env.IMAGEKIT_URL_ENDPOINT
    }/ik-genimg-prompt-${encodedPrompt}/clonegpt/${Date.now()}.png?tr=w-800,h-800`;
    // trigger generation by fetching from ImageKit
    let aiImageResponse;
    try {
      aiImageResponse = await axios.get(generatedImageUrl, {
        responseType: 'arraybuffer',
        timeout: 60000,
      });
    } catch (err) {
      console.error('ImageKit generation request failed', {
        url: generatedImageUrl,
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      return response
        .status(502)
        .json({ success: false, message: 'Failed to generate image from provider' });
    }

    // convert to base64
    const base64Image = `data:image/png;base64,${Buffer.from(
      aiImageResponse.data,
      'binary'
    ).toString('base64')}`;

    // upload to ImageKit
    let uploadResponse;
    try {
      uploadResponse = await imagekit.upload({
        file: base64Image,
        fileName: `${Date.now()}.png`,
        folder: 'clonegpt',
      });
    } catch (err) {
      console.error('ImageKit upload failed', {
        message: err.message,
        response: err.response?.data,
      });
      return response
        .status(502)
        .json({ success: false, message: 'Failed to upload generated image' });
    }

    const reply = {
      role: 'assistant',
      content: uploadResponse.url,
      timestamp: Date.now(),
      isImage: true,
      isPublished,
    };

    response.json({ success: true, reply });

    chat.messages.push(reply);
    await chat.save();

    await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });
  } catch (error) {
    console.error('Error generating image:', error.message);
    response.status(500).json({
      success: false,
      message: 'Image generation failed',
      error: error.message,
    });
  }
};

// api to get published images
export const getPublishedImages = async (request, response) => {
  try {
    const publishedImageMessages = await Chat.aggregate([
      { $unwind: '$messages' },
      {
        $match: {
          'messages.isImage': true,
          'messages.isPublished': true,
        },
      },
      {
        $project: {
          _id: 0,
          imageUrl: '$messages.content',
          userName: '$userName',
        },
      },
    ]);
    response.json({ success: true, images: publishedImageMessages.reverse() });
  } catch (error) {
    return response.json({ success: false, message: error.message });
  }
};
