function GenerationSkeleton() {
  return (
    <div className="flex flex-col-reverse w-full grow animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-1/4 my-4"></div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
      </div>
    </div>
  )
}

export default GenerationSkeleton
