// https://icon-sets.iconify.design/typcn/media-eject/

// special shoutout to https://yqnn.github.io/svg-path-editor/ which allowed me to split the path

// note: this icon has group based hover code built into it
export default function MediaEject({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-4 w-4'} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        className="opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100 "
        d="m12 4L12 4l-6.433 6.604A2 2 0 007 14h10a2 2 0 001.433-3.396"
      />
      <path fill="currentColor" d="M17 16H7a2 2 0 0 0 0 4h10a2 2 0 0 0 0-4" />
    </svg>
  )
}
