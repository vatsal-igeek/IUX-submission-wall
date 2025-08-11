import { useState } from "react";
import { FillHeartSvg, HeartSvg } from "../../icons";

const WishesCards = () => {
  // Sample data for wish cards
  const [wishes, setWishes] = useState([
    {
      id: 1,
      userName: "John D.",
      message:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia, molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum numquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentium optio, eaque rerum!",
      likes: 1500,
      isLiked: true,
      timestamp: "12:00 AM GMT",
      location: "INDIA",
    },
    {
      id: 2,
      userName: "John D.",
      message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia, molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum numquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentium optio, eaque rerum!",
      likes: 1500,
      isLiked: false,
      timestamp: "12:00 AM GMT",
      location: "INDIA"
    },
    {
      id: 3,
      userName: "John D.",
      message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia, molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum numquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentium optio, eaque rerum!",
      likes: 1500,
      isLiked: false,
      timestamp: "12:00 AM GMT",
      location: "INDIA"
    },
    {
      id: 4,
      userName: "John D.",
      message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia, molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum numquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentium optio, eaque rerum!",
      likes: 1500,
      isLiked: true,
      timestamp: "12:00 AM GMT",
      location: "INDIA"
    },
    {
      id: 5,
      userName: "John D.",
      message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia, molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum numquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentium optio, eaque rerum!",
      likes: 1500,
      isLiked: true,
      timestamp: "12:00 AM GMT",
      location: "INDIA"
    },
    {
      id: 6,
      userName: "John D.",
      message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia, molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum numquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentium optio, eaque rerum!",
      likes: 1500,
      isLiked: false,
      timestamp: "12:00 AM GMT",
      location: "INDIA"
    }
  ]);

  const handleLikeToggle = (id: number) => {
    setWishes((prevWishes) => prevWishes.map((wish) => (wish.id === id ? { ...wish, isLiked: !wish.isLiked, likes: wish.isLiked ? wish.likes - 1 : wish.likes + 1 } : wish)));
  };

  const formatLikes = (likes: number) => {
    if (likes >= 1000) {
      return `${(likes / 1000).toFixed(1)}K`;
    }
    return likes.toString();
  };

  return (
    <div className="py-[2.5rem] md:py-[3.75rem] lg:py-[6.25rem]">
      <div className="container mx-auto w-full max-w-5xl px-4 md:px-28 lg:px-[1.875rem] xl:px-0">
        {/* Section Title */}
        <h2 className="mb-[2.5rem] md:mb-[3.75rem] text-[2.5rem] md:text-[3.75rem] lg:text-[4rem] font-extrabold text-center">Wishes</h2>

        {/* Wishes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
          {wishes.map((wish) => (
            <div key={wish.id} className="bg-inputBg rounded-2xl p-6 transition-colors duration-200">
              {/* Header Section */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl md:text-[2rem] font-bold text-cardCreator">{wish.userName}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-lg md:text-xl">{formatLikes(wish.likes)}</span>
                  <div onClick={() => handleLikeToggle(wish.id)} className="cursor-pointer transition-transform duration-200 hover:scale-110">
                    {wish.isLiked ? <FillHeartSvg /> : <HeartSvg />}
                  </div>
                </div>
              </div>

              <p className="text-sm md:text-base leading-relaxed text-subTitle">{wish.message}</p>

              <div className="mt-[1.875rem] text-primary-main text-sm md:text-base font-medium">
                <div className="flex items-center">
                  <span>{wish.timestamp}</span>
                  <div className="flex-1 mx-3 border-t border-dashed border-primary-main"></div>
                  <span>{wish.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishesCards;
