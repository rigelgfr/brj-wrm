import { Spinner } from "@/components/ui/Spinner"; // Assuming you have a Spinner component

export default function Loading() {
  return (
    <div className="flex justify-center items-center">
      <div className="flex flex-col items-center">
        <Spinner size={70} speed={2} />
        <p className="mt-2 text-sm text-[#5c8435]">Loading...</p>
      </div>
    </div>  
  );
}
