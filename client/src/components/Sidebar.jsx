import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import moment from 'moment/moment';
import toast from 'react-hot-toast';

const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {
  const {
    chats,
    setSelectedChat,
    theme,
    setTheme,
    user,
    navigate,
    createNewChat,
    setChats,
    axios,
    fetchUsersChats,
    token,
    setToken,
  } = useAppContext();
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState({ open: false, chatId: null });

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    toast.success('Logged out successfully');
  };

  const deleteChat = async (chatId) => {
    if (!confirm) return Promise.reject('Cancelled');
    const { data } = await axios.post(
      '/api/chat/delete',
      { chatId },
      { headers: { Authorization: token } }
    );
    if (!data.success) return Promise.reject(data.message);
    setChats((prev) => prev.filter((chat) => chat._id !== chatId));
    await fetchUsersChats();
    return data.message;
  };

  return (
    <div
      className={`flex flex-col h-screen min-w-72 p-5 dark:bg-gradient-to-b
      from-[#242124]/30 to-[#000000]/30 border-r border-[#80609F]
      backdrop-blur-3xl transition-all duration-500 max-md:absolute left-0 z-1 ${
        !isMenuOpen && '-translate-x-full'
      }`}
    >
      {/* logo */}
      <img
        src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
        alt="logo"
        className="w-full max-w-48"
      />

      {/* New Chat Button */}
      <button
        className="flex justify-center items-center w-full py-2 mt-10 text-white bg-gradient-to-r
        from-[#A456F7] to-[#3D81F6] hover:from-[#9840f6] hover:to-[#3079f6] text-sm rounded-md cursor-pointer"
        onClick={createNewChat}
      >
        New Chat <span className="ml-1 text-xl"> +</span>
      </button>

      {/* search conversation */}
      <div className="flex items-center gap-2 p-3 mt-4 border border-gray-400 dark:border-white/20 rounded-md">
        <img src={assets.search_icon} alt="search icon" className="w-4 not-dark:invert" />
        <input
          type="text"
          placeholder="search conversation"
          value={search}
          className="text-xs placeholder:text-gray-400 outline-none"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* recent chats */}
      {chats.length > 0 && <p className="mt-4 text-sm">Recent Chats</p>}

      <div className="flex-1 overflow-y-scroll mt-3 text-sm space-y-3">
        {chats
          .filter((chat) =>
            chat.messages[0]
              ? chat.messages[0]?.content?.toLowerCase().includes(search.toLowerCase())
              : chat.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((chat) => (
            <div
              onClick={() => {
                navigate('/');
                setSelectedChat(chat);
              }}
              key={chat._id}
              className="p-2 px-4 dark:bg-[#57317C]/10 border border-gray-300 
        dark:border-[#80609F]/15 rounded-md cursor-pointer flex items-center justify-between group"
            >
              <div>
                <p className="truncate w-full">
                  {chat.messages.length > 0 ? chat.messages[0].content.slice(0, 32) : chat.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#B1A6C0]">
                  {moment(chat.updatedAt).fromNow()}
                </p>
              </div>

              <img
                src={assets.bin_icon}
                alt="delete icon"
                className="hidden group-hover:block w-8 h-8 cursor-pointer not-dark:invert hover:bg-gray-500/40 rounded-full p-2 transition-all duration-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete({ open: true, chatId: chat._id });
                }}
              />
              {confirmDelete.open && (
                <div className="w-screen fixed inset-0 flex items-center justify-center z-50 bg-black/40">
                  <div className="bg-white dark:bg-[#2a2235] p-6 rounded-lg shadow-lg w-80 text-center">
                    <h3 className="text-lg font-semibold mb-3">Delete Chat?</h3>
                    <p className="text-sm text-gray-500 mb-5">
                      Are you sure you want to delete this chat? This action cannot be undone.
                    </p>
                    <div className="flex justify-center gap-3">
                      <button
                        className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500"
                        onClick={() => setConfirmDelete({ open: false, chatId: null })}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                        onClick={async () => {
                          setConfirmDelete({ open: false, chatId: null });
                          toast.promise(deleteChat(confirmDelete.chatId), {
                            loading: 'Deleting...',
                            success: (msg) => msg,
                            error: (err) => err,
                          });
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* community images */}
      <div
        className="flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-103
      transition-all"
        onClick={() => {
          navigate('/community');
        }}
      >
        <img src={assets.gallery_icon} alt="community images" className="w-4.5 not-dark:invert" />
        <div className="flex flex-col text-sm">
          <p>Community Images</p>
        </div>
      </div>

      {/* credit purchases option */}
      <div
        className="flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-103
      transition-all"
        onClick={() => {
          navigate('/credits');
        }}
      >
        <img src={assets.diamond_icon} alt="credit images" className="w-4.5 dark:invert" />
        <div className="flex flex-col text-sm">
          <p>Credits: {user?.credits}</p>
          <p>Purchase credits to use CloneGPT</p>
        </div>
      </div>

      {/* toggle dark mode */}
      <div className="flex items-center justify-between   gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer ">
        <div className="flex items-center gap-2 text-sm">
          <img src={assets.theme_icon} className="w-4 not-dark:invert" alt="" />
          <p>Dark Mode</p>
        </div>
        <label className="relative inline-flex cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            checked={theme === 'dark'}
          />
          <div className="w-9 h-5 bg-gray-400 rounded-full peer-checked:bg-purple-600 transition-all"></div>
          <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
        </label>
      </div>

      {/* user account */}
      <div className="group flex items-center gap-3 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer">
        <img
          src={assets.user_icon}
          alt="user account"
          className="w-7 rounded-full not-dark:invert"
        />
        <p className="flex-1 text-sm dark:text-primary truncate">{user ? user.name : 'Login'}</p>
        {user && (
          <img
            src={assets.logout_icon}
            className="h-5 cursor-pointer hidden not-dark:invert group-hover:block"
            onClick={logout}
          />
        )}
      </div>
      <img
        src={assets.close_icon}
        className="absolute top-3 right-3 w-5 h-5 cursor-pointer md:hidden not-dark:invert"
        alt="close icon"
        onClick={() => setIsMenuOpen((prev) => !prev)}
      />
    </div>
  );
};

export default Sidebar;
