import { useState, useEffect, useRef } from "react";

import { FillHeartSvg, HeartSvg } from "../../icons";
import { wishService } from "../../api/wish/endPoints";

type Wish = {
  id: string;
  userName: string;
  message: string;
  likes: number;
  isLiked: boolean;
  timestamp: string;
  location: string;
};

const WishesCards = () => {
  // Sample data for wish cards
  const [wishes, setWishes] = useState<Wish[]>([]);

  useEffect(() => {
    const fetchWishes = async () => {
      try {
        const data = await wishService.getAllWishes();
        const wishesData: Wish[] = data.map((item: any) => ({
          id: item.id,
          userName: item.userName ?? item.user?.name ?? "Anonymous",
          message: item.message ?? "",
          likes: item.likes ?? 0,
          isLiked: item.isLiked ?? false,
          timestamp: item.timestamp ?? "",
          location: item.location ?? "",
        }));
        setWishes(wishesData);
      } catch (error) {
        console.error(error);
      }
    };
    fetchWishes();
  }, []);

  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleLikeToggle = (id: string) => {
    console.log(`Toggling like for wish ID: ${id}`);
    // setWishes((prevWishes) =>
    //   prevWishes.map((wish) =>
    //     wish.id === id
    //       ? {
    //           ...wish,
    //           isLiked: !wish.isLiked,
    //           likes: wish.isLiked ? wish.likes - 1 : wish.likes + 1,
    //         }
    //       : wish
    //   )
    // );
  };

  const formatLikes = (likes: number) => {
    if (likes >= 1000) {
      return `${(likes / 1000).toFixed(1)}K`;
    }
    return likes.toString();
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cardId = Number.parseInt(
            entry.target.getAttribute("data-card-id") || "0"
          );
          if (entry.isIntersecting) {
            setVisibleCards((prev) => new Set([...prev, String(cardId)]));
          } else {
            setVisibleCards((prev) => {
              const newSet = new Set(prev);
              newSet.delete(String(cardId));
              return newSet;
            });
          }
        });
      },
      {
        threshold: 0.5, // Card must be 50% visible to be considered "intersecting"
        rootMargin: "10% 0px -25% 0px", // Negative margins to trigger when card goes halfway out
      }
    );

    // Observe all cards
    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    // Cleanup function
    return () => {
      observer.disconnect();
    };
  }, []);

  const getCardAnimation = (index: number, cardId: string) => {
    const isVisible = visibleCards.has(cardId);
    const isEven = index % 2 === 0;

    if (!isVisible) {
      return isEven
        ? "translate-x-[-100px] opacity-0 rotate-[-15deg] scale-95"
        : "translate-x-[100px] opacity-0 rotate-[15deg] scale-95";
    }

    return "translate-x-0 opacity-100 rotate-0 scale-100";
  };

  return (
    <div className="py-[2.5rem] md:py-[3.75rem] lg:py-[6.25rem] min-h-screen overflow-x-hidden md:overflow-x-visible">
      <div className="container mx-auto w-full max-w-5xl px-4 md:px-28 lg:px-[1.875rem] xl:px-0">
        {/* Section Title */}
        <h2 className="mb-[2.5rem] md:mb-[3.75rem] text-[2.5rem] md:text-[3.75rem] lg:text-[4rem] font-extrabold text-center">
          Wishes
        </h2>

        {/* Wishes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
          {wishes.map((wish, index) => (
            <div
              key={wish.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              data-card-id={wish.id}
              className={`bg-inputBg rounded-2xl p-6 shadow-lg transition-all duration-700 ease-out transform ${getCardAnimation(
                index,
                wish.id
              )}`}
            >
              {/* Header Section */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl md:text-[2rem] font-bold text-cardCreator">
                  {wish.userName}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-lg md:text-xl">
                    {formatLikes(wish.likes)}
                  </span>
                  <div
                    onClick={() => handleLikeToggle(wish.id)}
                    className="cursor-pointer transition-transform duration-200 hover:scale-110"
                  >
                    {wish.isLiked ? <FillHeartSvg /> : <HeartSvg />}
                  </div>
                </div>
              </div>

              <p className="text-sm md:text-base leading-relaxed text-subTitle">
                {wish.message}
              </p>

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
