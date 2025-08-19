const SkeletonCard = () => {
  return (
    <div className="bg-inputBg rounded-2xl p-6 shadow-lg animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-6 md:h-8 bg-skeleton rounded w-1/3"></div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-8 bg-skeleton rounded"></div>
          <div className="h-6 w-6 bg-skeleton rounded-full"></div>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-2">
        <div className="h-3 bg-skeleton rounded w-full"></div>
        <div className="h-3 bg-skeleton rounded w-5/6"></div>
        <div className="h-3 bg-skeleton rounded w-4/6"></div>
      </div>

      {/* Footer */}
      <div className="mt-[1.875rem]">
        <div className="flex items-center">
          <div className="h-4 w-12 bg-skeleton rounded"></div>
          <div className="flex-1 mx-3 border-t border-dashed border-skeleton"></div>
          <div className="h-4 w-16 bg-skeleton rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
