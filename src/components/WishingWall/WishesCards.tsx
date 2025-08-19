import { useState, useEffect, useRef, useCallback } from "react";

import { FillHeartSvg, HeartSvg } from "../../icons";
import { wishService } from "../../api/wish/endPoints";
import SkeletonCard from "./SkeletonCard";
import { cn } from "../../utils/cn";
import { wishLikeService } from "../../api/wishlike/endPoints";
import { getCookie } from "../../utils";
import toast from "react-hot-toast";
import formatTimestamp from "../../utils/formatTimestamp";

const WishesCards = () => {
  // Sample data for wish cards
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [lastDoc, setLastDoc] = useState<any>(null); // DocumentSnapshot for cursor
  const currentUserId = getCookie("iux-token");

  const ITEMS_PER_PAGE = 10;

  const fetchWishes = useCallback(
    async (isLoadMore = false) => {
      try {
        if (!currentUserId) return;

        if (!isLoadMore) {
          setLoading(true);
          setLastDoc(null); // Reset cursor for fresh load
        } else {
          setLoadingMore(true);
        }

        const result = await wishService.getAllWishes(
          ITEMS_PER_PAGE,
          currentUserId,
          isLoadMore ? lastDoc : null
        );

        // Map WishWithMeta[] to Wish[]
        const wishesWithUser: Wish[] = result.wishes.map((wish: any) => ({
          ...wish,
          user: {
            firstName: wish.user.firstName || "",
            lastName: wish.user.lastName || "",
            country: wish.user.country || "",
          },
        }));

        if (!isLoadMore) {
          setWishes(wishesWithUser);
        } else {
          setWishes((prev) => [...prev, ...wishesWithUser]);
        }

        // Update cursor and check if we have more data
        setLastDoc(result.lastDoc);
        setHasMore(
          wishesWithUser.length === ITEMS_PER_PAGE && result.lastDoc !== null
        );

        setLoading(false);
        setLoadingMore(false);
      } catch (error) {
        setLoading(false);
        setLoadingMore(false);
        console.error(error);
      }
    },
    [currentUserId, lastDoc]
  );

  useEffect(() => {
    // Reset state and fetch initial data
    setLastDoc(null);
    setHasMore(true);
    fetchWishes(false);
  }, [currentUserId]); // Only depend on currentUserId

  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleLikeToggle = async (wishId: string) => {
    try {
      if (!currentUserId) return;
      await wishLikeService.toggleLike(wishId, currentUserId);
      toast.success("wish Liked successfully");
    } catch (error) {
      toast.error("Failed to add or remove like");
    }
  };

  const formatLikes = (likes: number) => {
    if (likes >= 1000) {
      return `${(likes / 1000).toFixed(1)}K`;
    }
    return likes.toString();
  };

  // Intersection Observer for card animations
  useEffect(() => {
    if (!wishes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cardId = entry.target.getAttribute("data-card-id") || "";
          if (entry.isIntersecting) {
            setVisibleCards((prev) => new Set([...prev, cardId]));
          } else {
            setVisibleCards((prev) => {
              const newSet = new Set(prev);
              newSet.delete(cardId);
              return newSet;
            });
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: "10% 0px -25% 0px",
      }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [wishes]);

  // Intersection Observer for infinite scroll
  const loadMoreCallback = useCallback(() => {
    if (!hasMore || loadingMore) return;
    fetchWishes(true);
  }, [hasMore, loadingMore, fetchWishes]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreCallback();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    const currentLoadMoreRef = loadMoreRef.current;
    if (currentLoadMoreRef && hasMore && !loadingMore) {
      observer.observe(currentLoadMoreRef);
    }

    return () => {
      if (currentLoadMoreRef) {
        observer.unobserve(currentLoadMoreRef);
      }
    };
  }, [loadMoreCallback, hasMore, loadingMore]);

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
          {loading && wishes.length === 0
            ? [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
            : wishes?.map((wish, index) => (
                <div
                  key={wish.id}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  data-card-id={wish.id}
                  className={cn(
                    `bg-inputBg rounded-2xl p-6 shadow-lg transition-all duration-700 ease-out transform`,
                    getCardAnimation(index, wish.id)
                  )}
                >
                  {/* Header Section */}
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl md:text-[2rem] font-bold text-cardCreator">
                      {wish.user.firstName} {wish.user.lastName}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-lg md:text-xl">
                        {formatLikes(wish.likeCount)}
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
                    {wish.text}
                  </p>

                  <div className="mt-[1.875rem] text-primary-main text-sm md:text-base font-medium">
                    <div className="flex items-center">
                      <span>
                        {formatTimestamp(
                          new Date(wish.createdAt.seconds * 1000)
                        )}
                      </span>
                      <div className="flex-1 mx-3 border-t border-dashed border-primary-main"></div>
                      <span>{wish.user.country}</span>
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {/* Loading More Indicator */}
        {loadingMore && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl mx-auto mt-10">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={`loading-${i}`} />
            ))}
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        {hasMore && !loading && wishes.length > 0 && (
          <div
            ref={loadMoreRef}
            className="h-20 flex items-center justify-center mt-10"
          >
            <div className="text-center text-gray-500">
              {loadingMore ? "Loading more wishes..." : "Scroll for more"}
            </div>
          </div>
        )}

        {/* No More Data Message */}
        {!hasMore && wishes.length > 0 && (
          <div className="text-center mt-10 text-gray-500">
            No more wishes to load
          </div>
        )}
      </div>
    </div>
  );
};

export default WishesCards;

type Timestamp = {
  seconds: number;
  nanoseconds: number;
};

type User = {
  firstName: string;
  lastName: string;
  country: string;
};

type Wish = {
  id: string;
  text: string;
  createdAt: Timestamp;
  isLiked: boolean;
  likeCount: number;
  userId: string;
  user: User;
};
