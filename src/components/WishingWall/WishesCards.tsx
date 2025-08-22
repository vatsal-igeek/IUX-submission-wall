import { useState, useEffect, useRef, useCallback } from "react";

import { FillHeartSvg, HeartSvg } from "../../icons";
import { wishService } from "../../api/wish/endPoints";
import SkeletonCard from "./SkeletonCard";
import { cn } from "../../utils/cn";
import { getCookie } from "../../utils";
import formatTimestamp from "../../utils/formatTimestamp";
import { useOptimisticWishes } from "../../hooks/useOptimisticWishes";
import type { Wish } from "../../types/wishesh";

const WishesCards = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [lastDoc, setLastDoc] = useState<any>(null); // DocumentSnapshot for cursor
  const currentUserId = getCookie("iux-token");

  const ITEMS_PER_PAGE = 10;

  // Use the optimistic wishes hook
  const { wishes, setWishes, toggleLikeOptimistic } = useOptimisticWishes(
    currentUserId || ""
  );

  // Keep track of unsubscribe functions for cleanup
  const unsubscribersRef = useRef<(() => void)[]>([]);

  // Subscribe to the first page of wishes in realtime
  useEffect(() => {
    if (!currentUserId) return;

    setLoading(true);
    setLastDoc(null);
    setHasMore(true);

    // cleanup old subscriptions
    unsubscribersRef.current.forEach((unsub) => unsub());
    unsubscribersRef.current = [];

    const unsubscribe = wishService.subscribeToWishes(
      ITEMS_PER_PAGE,
      currentUserId,
      null,
      ({ wishes: newWishes, lastDoc: newLastDoc }) => {
        const mapped: Wish[] = newWishes.map((wish: any) => ({
          ...wish,
          user: {
            firstName: wish.user?.firstName || "",
            lastName: wish.user?.lastName || "",
            country: wish.user?.country || "",
          },
        }));

        setWishes(mapped);
        setLastDoc(newLastDoc);
        setHasMore(mapped.length === ITEMS_PER_PAGE && newLastDoc !== null);
        setLoading(false);
      }
    );

    unsubscribersRef.current.push(unsubscribe);

    return () => {
      unsubscribersRef.current.forEach((unsub) => unsub());
      unsubscribersRef.current = [];
    };
  }, [currentUserId, setWishes]);

  // Subscribe to load more wishes (pagination)
  const loadMoreWishes = useCallback(() => {
    if (!currentUserId || !hasMore || !lastDoc) return;

    setLoadingMore(true);

    const unsubscribe = wishService.subscribeToWishes(
      ITEMS_PER_PAGE,
      currentUserId,
      lastDoc,
      ({ wishes: newWishes, lastDoc: newLastDoc }) => {
        const mapped: Wish[] = newWishes.map((wish: any) => ({
          ...wish,
          user: {
            firstName: wish.user?.firstName || "",
            lastName: wish.user?.lastName || "",
            country: wish.user?.country || "",
          },
        }));

        setWishes((prev) => [...prev, ...mapped]);
        setLastDoc(newLastDoc);
        setHasMore(mapped.length === ITEMS_PER_PAGE && newLastDoc !== null);
        setLoadingMore(false);
      }
    );

    unsubscribersRef.current.push(unsubscribe);
  }, [currentUserId, hasMore, lastDoc, setWishes]);

  // Intersection Observer for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreWishes();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    const node = loadMoreRef.current;
    if (node && hasMore && !loadingMore) observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, [hasMore, loadingMore, loadMoreWishes]);

  function formatTimestampToGMT(timestamp: { seconds: number; nanoseconds: number }) {
  const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6);

  let time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "GMT",
  });

  // Force AM/PM to uppercase
  time = time.replace("am", "AM").replace("pm", "PM");

  return time + " GMT";
}
  

  // For card entry animations
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
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
              const next = new Set(prev);
              next.delete(cardId);
              return next;
            });
          }
        });
      },
      { threshold: 0.5, rootMargin: "10% 0px -25% 0px" }
    );

    cardRefs.current.forEach((ref) => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, [wishes]);

  const formatLikes = (likes: number) =>
    likes >= 1000 ? `${(likes / 1000).toFixed(1)}K` : likes.toString();

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
        <h2 className="mb-[2.5rem] md:mb-[3.75rem] text-[2.5rem] md:text-[3.75rem] lg:text-[4rem] font-extrabold text-center">
          Wishes
        </h2>

        {/* Wishes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
          {loading && wishes.length === 0
            ? [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
            : wishes.map((wish, index) => (
                <div
                  key={wish.id}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  data-card-id={wish.id}
                  className={cn(
                    "bg-inputBg rounded-2xl p-6 shadow-lg transition-all duration-700 ease-out transform flex flex-col justify-between h-full",
                    getCardAnimation(index, wish.id),
                    wish.isOptimistic && "opacity-70 ring-2 ring-primary-main"
                  )}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl md:text-[2rem] font-bold text-cardCreator">
                      {wish.user?.firstName} {wish.user?.lastName}
                      {wish.isOptimistic && (
                        <span className="ml-2 text-sm text-primary-main opacity-70">
                          (Saving...)
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-lg md:text-xl">
                        {formatLikes(wish.likeCount)}
                      </span>
                      <div
                        onClick={() => toggleLikeOptimistic(wish.id)}
                        className={cn(
                          "cursor-pointer transition-transform duration-200 hover:scale-110",
                          wish.isOptimistic && "pointer-events-none opacity-50"
                        )}
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
                        {/* {formatTimestamp(
                          wish.createdAt?.seconds
                            ? new Date(wish.createdAt.seconds * 1000)
                            : new Date()
                        )} */}
                        {formatTimestampToGMT(wish.createdAt)}
                      </span>
                      <div className="flex-1 mx-3 border-t border-dashed border-primary-main"></div>
                      <span className="uppercase">{wish.user?.country}</span>
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
