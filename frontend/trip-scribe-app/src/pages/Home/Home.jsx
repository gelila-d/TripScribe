import React, { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import Navbar from '../../components/Navbar.jsx';
import axiosInstance from '../../utils/axiosInstance.js';
import { MdAdd } from 'react-icons/md';
import Modal from 'react-modal';
import TravelStoryCard from '../../components/Cards/TravelStoryCard.jsx';
import EmptyCard from '../../components/Cards/EmptyCard.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import AddEditTravelStory from './AddEditTravelStory.jsx';
import ViewTravelStory from './ViewTravelStory.jsx';
import { DayPicker } from 'react-day-picker';
import FilterInfoTitle from '../../components/Cards/FilterInfoTitle.jsx';

import NoStoryImg from "../../assets/images/no-story.png"; 
import NoSearchImg from "../../assets/images/no-search.png";

const Home = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [allStories, setAllStories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState(''); 
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [loading, setLoading] = useState(false); 

  const [openAddEditModel, setOpenAddEditModel] = useState({ isShown: false, type: "add", data: null });
  const [openViewModal, setOpenViewModal] = useState({ isShown: false, data: null });

  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get('/get-user');
      if (response.data && response.data.user) setUserInfo(response.data.user);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    }
  };

  const getAllTravelStories = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/get-all-stories');
      if (response.data?.stories) setAllStories(response.data.stories);
    } catch (error) {
      console.log("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStory = async (storyData) => {
    try {
      const response = await axiosInstance.post("/add-travel-story", storyData);
      if (response.data && !response.data.error) {
        toast.success("Story added successfully");
        getAllTravelStories();
        setOpenAddEditModel({ isShown: false, type: "add", data: null });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleUpdateStory = async (storyId, storyData) => {
    try {
      const response = await axiosInstance.put("/edit-travel-story/" + storyId, storyData);
      if (response.data && !response.data.error) {
        toast.success("Story updated successfully");
        refreshData();
        setOpenAddEditModel({ isShown: false, type: "add", data: null });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handleDeleteStory = async (data) => {
    setLoading(true); // START LOADING FOR DELETE
    try {
      const response = await axiosInstance.delete("/delete-travel-story/" + data._id);
      if (response.data && !response.data.error) {
        toast.error("Story deleted successfully");
        getAllTravelStories();
        setOpenViewModal({ isShown: false, data: null });
        setOpenAddEditModel({ isShown: false, type: "add", data: null });
      }
    } catch (error) {
      toast.error("Delete failed");
    } finally {
      setLoading(false); // STOP LOADING
    }
  };

  const updateIsFavourite = async (storyData) => {
    try {
      const response = await axiosInstance.put(`/update-is-favourite/${storyData._id}`, {
        isFavourite: !storyData.isFavourite,
      });
      if (response.data) { 
        toast.success("Updated!");
        refreshData();
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const refreshData = () => {
    if (filterType === "search" && searchQuery) onSearchStory(searchQuery);
    else if (filterType === "date") filterStoriesByDate(dateRange);
    else getAllTravelStories();
  };

  const onSearchStory = async (query) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/search", { params: { query } });
      if (response.data?.stories) {
        setFilterType("search");
        setAllStories(response.data.stories);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleClearSearch = () => {
    setFilterType("");
    setSearchQuery("");
    setDateRange({ from: null, to: null });
    getAllTravelStories(); 
  };

  const filterStoriesByDate = async (day) => {
    if (!day?.from || !day?.to) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get("/travel-stories/filter", {
        params: { startDate: day.from.getTime(), endDate: day.to.getTime() },
      });
      if (response.data?.stories) {
        setFilterType("date");
        setAllStories(response.data.stories);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleDayClick = (day) => {
    setDateRange(day);
    filterStoriesByDate(day);
  };

  useEffect(() => {
    getUserInfo();
    getAllTravelStories();
  }, []); 

  return (
    <>
      <Navbar userInfo={userInfo} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearchNote={onSearchStory} handleClearSearch={handleClearSearch} />
      
      <div className='container mx-auto py-10'>
        <FilterInfoTitle filterType={filterType} filterDates={dateRange} onClear={handleClearSearch} />
        
        <div className='flex gap-7'>
          <div className='flex-1'>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-500 font-medium">Processing...</p>
              </div>
            ) : allStories.length > 0 ? (
              <div className='grid grid-cols-2 gap-4'>
                {allStories.map((item) => (
                  <TravelStoryCard
                    key={item._id} 
                    imgUrl={item.imageUrl} 
                    title={item.title}
                    story={item.story}
                    date={item.visitedDate} 
                    visitedLocation={item.visitedLocations} 
                    isFavourite={item.isFavourite}
                    onEdit={() => setOpenAddEditModel({ isShown: true, type: "edit", data: item })}
                    onClick={() => setOpenViewModal({ isShown: true, data: item })} 
                    onFavouriteClick={() => updateIsFavourite(item)}
                  />
                ))}
              </div>
            ) : (
              <EmptyCard imgSrc={filterType ? NoSearchImg : NoStoryImg} message={filterType ? `Oops! No stories found.` : `Start creating your first Travel Story!`} />
            )}
          </div>

          <div className='w-[320px]'>
            <div className='bg-white border border-slate-200 rounded-lg shadow-lg p-4'>
              <DayPicker mode="range" selected={dateRange} onSelect={handleDayClick} pagedNavigation />
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={openAddEditModel.isShown} onRequestClose={() => !loading && setOpenAddEditModel({ isShown: false, type: 'add', data: null })} style={{ overlay: { backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 999 } }} appElement={document.getElementById('root')} className='model-box scrollbar'>
        <AddEditTravelStory type={openAddEditModel.type} storyInfo={openAddEditModel.data} onClose={() => setOpenAddEditModel({ isShown: false, type: 'add', data: null })} onAddStory={handleAddStory} onUpdateStory={handleUpdateStory} onDeleteStory={handleDeleteStory} />
      </Modal>

      <Modal isOpen={openViewModal.isShown} onRequestClose={() => !loading && setOpenViewModal({ isShown: false, data: null })} style={{ overlay: { backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 999 } }} appElement={document.getElementById('root')} className='model-box scrollbar'>
        <ViewTravelStory storyInfo={openViewModal.data || null} onClose={() => setOpenViewModal({ isShown: false, data: null })} onEditClick={() => { const d = openViewModal.data; setOpenViewModal({ isShown: false, data: null }); setOpenAddEditModel({ isShown: true, type: "edit", data: d }); }} onDeleteClick={() => handleDeleteStory(openViewModal.data)} />
      </Modal>

      <button className='w-16 h-16 flex items-center justify-center rounded-full bg-violet-500 hover:bg-violet-600 fixed right-10 bottom-10 shadow-2xl z-50 transition-all' onClick={() => setOpenAddEditModel({ isShown: true, type: "add", data: null })}>
        <MdAdd className='text-[32px] text-white' />
      </button>

      <ToastContainer position="bottom-right" autoClose={2000} theme="colored" />
    </>
  );
};

export default Home;