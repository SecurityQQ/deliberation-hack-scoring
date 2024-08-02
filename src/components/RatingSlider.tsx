// components/RatingSlider.js

import { Slider } from "@/components/ui/slider"; // Ensure you have a Slider component

const RatingSlider = ({ value, onChange }) => {
  return (
    <div className="w-full">
      <Slider
        defaultValue={[value]}
        max={100}
        step={1}
        onValueChange={(value) => onChange(value[0])}
        className="w-[60%]"
      />
      <div className="mt-2 text-sm text-muted-foreground">
        Use the slider to rate this project. 0 means poor and 100 means excellent.
      </div>
    </div>
  );
};

export default RatingSlider;
