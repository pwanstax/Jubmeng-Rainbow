import mongoose from "mongoose";
import Product from "./schema/product.schema.js";

const ClinicSchema = new mongoose.Schema(
  {
    ...Product,
  },
  {timestamps: true}
);

ClinicSchema.methods.setLocation = function (latitude, longitude) {
  this.location = {
    type: "Point",
    coordinates: [longitude, latitude],
  };
};

ClinicSchema.methods.setOpenHours = function (open_hours) {
  let new_open_hours = open_hours;
  console.log("Hi");

  for (const day of new_open_hours) {
    console.log(day);
    for (let e of day.periods) {
      console.log(e);
      const open_times = e.open_at.split(":");
      e.open_at = parseInt(open_times[0]) * 60 + parseInt(open_times[1]);

      const close_times = e.close_at.split(":");
      e.close_at = parseInt(close_times[0]) * 60 + parseInt(close_times[1]);
    }
  }
  this.open_hours = new_open_hours;
};

ClinicSchema.methods.toAuthJSON = function () {
  return {
    owner: this.owner,
    name: this.name,
    status: this.status,
    province: this.province,
    open_hours: this.open_hours,
  };
};

const Clinic = mongoose.model("Clinic", ClinicSchema);
export default Clinic;
