import React, { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import Navbar from '../../components/Navbar.jsx';
import axiosInstance from '../../utils/axiosInstance.js';
import {MdAdd} from 'react-icons/md';
import Modal from 'react-modal';
import TravelStoryCard from '../../components/Cards/TravelStoryCard.jsx';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import AddEditTravelStory from './AddEditTravelStory.jsx';
import ViewTravelStory from './ViewTravelStory.jsx';

const Home = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [allStories, setAllStories] = useState([]);
const [openAddEditModel,setOpenAddEditModel]= useState({
  isShown:false,
  type:"add",
  data:null,
});
 const [openViewModal,setOpenViewModal]= useState({
  isShown:false,
  date:null,
 })



  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get('/get-user');
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    }
  };

  const getAllTravelStories = async () => {
    try {
      const response = await axiosInstance.get('/get-all-stories');
      if (response.data && response.data.stories) {
        setAllStories(response.data.stories);
      }
    } catch (error) {
      console.log("unexpected error occured. please try again later.");
    }
  };

 const handleEdit = (data) => {
  setOpenAddEditModel({ 
    isShown: true, 
    type: "edit", 
    data: data    
  }); 
};
  const handleViewStory = (data) => {
    setOpenViewModal({isShown:true,data})
  };
 const updateIsFavourite = async (storyData) => {
  const storyId = storyData._id;
  try {
    const response = await axiosInstance.put(`/update-is-favourite/${storyId}`, {
      isFavourite: !storyData.isFavourite,
    });

    if (response.data) { 
      toast.success("Story updated successfully!");
      getAllTravelStories(); 
    }
  } catch (error) {
    console.error("API Error:", error);
    toast.error("An error occurred");
  }
};

  useEffect(() => {
    getUserInfo();
    getAllTravelStories();
  }, []); 

  return (
    <>
      <Navbar userInfo={userInfo} />
     
      <div className='container mx-auto py-10'>
        <div className='flex gap-7'>
          <div className='flex-1'>
            {allStories.length > 0 ? (
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
                    onEdit={() => handleEdit(item)}
                    onClick={() => handleViewStory(item)} 
                    onFavouriteClick={() => updateIsFavourite(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center mt-10">
                <p>No stories found. Start adding your travels!</p>
              </div>
            )}
          </div>
          <div className='w-[320px]'></div>
        </div>
      </div>
 <Modal
  isOpen={openAddEditModel.isShown}
  onRequestClose={() => setOpenAddEditModel({ isShown: false, type: 'add', data: null })}
  style={{
    overlay: {
      backgroundColor: 'rgba(0,0,0,0.4)',
      zIndex: 999,
    }
  }}
  appElement={document.getElementById('root')}
  className='model-box scrollbar' 
>
 
  <div className="h-full overflow-y-auto pr-2"> 
     <AddEditTravelStory
        type={openAddEditModel.type}
        storyInfo={openAddEditModel.data}
        onClose={() => setOpenAddEditModel({ isShown: false, type: 'add', data: null })}
        getAllTravelStories={getAllTravelStories}
     />
  </div>
</Modal>


<Modal
  isOpen={openViewModal.isShown}
  onRequestClose={() => setOpenViewModal({ isShown: false, data: null })} // Added for clicking outside
  style={{ 
    overlay: {
      backgroundColor: 'rgba(0,0,0,0.4)',
      zIndex: 999,
    }
  }}
  appElement={document.getElementById('root')}
  className='model-box scrollbar' 
>
  <ViewTravelStory
    storyInfo={openViewModal.data || null}
    
    onClose={() => {
      setOpenViewModal((prevState) => ({ ...prevState, isShown: false }));
    }}
    onEditClick={() => {
      setOpenViewModal((prevState) => ({ ...prevState, isShown: false }));
      handleEdit(openViewModal.data || null);
    }}
    onDeleteClick={() => {}}
  />
</Modal>
   <button 
  className='w-16 h-16 flex items-center justify-center rounded-full bg-violet-500 hover:bg-violet-600 fixed right-10 bottom-10 shadow-2xl z-50'
  onClick={() => {
    setOpenAddEditModel({ isShown: true, type: "add", data: null });
  }}
>
  <MdAdd className='text-[32px] text-white' />
</button>


      <ToastContainer 
  position="bottom-right" 
  autoClose={2000} 
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  pauseOnFocusLoss
  draggable
  pauseOnHover
  theme="colored"
  style={{ zIndex: 99999 }} 
/>
    </>
  );
};

export default Home;