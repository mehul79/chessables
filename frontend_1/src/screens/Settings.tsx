import LandingBtn from "@/components/LandingBtn";

export default function Settings(){
  return(
    <div className="h-screen flex justify-center">
      <div className="mt-10">
        <button>
          <LandingBtn text="Draw" variant="yellow"  />
        </button>
      </div>
    </div>
  )
}