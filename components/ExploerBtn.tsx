'use client'
import Image from "next/image"

const ExploerBtn = () => {
  return (
    <button
     onClick={() => console.log("CLICK")} 
     type="button"
     className="mt-7 mx-auto"
     id="explore-btn"
     >
        <a href="#event">
            Explore Event
            <Image 
                src="/icons/arrow-down.svg" 
                alt="arrow-down" 
                width={24}
                height={24}
            />
        </a>
    </button>
  )
}

export default ExploerBtn 