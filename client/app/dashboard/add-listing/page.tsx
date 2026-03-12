import "./add-listing.css";
import AddListingForm from "./AddListingForm";

export const metadata = {
  title: "Add Listing - 360Nepal Dashboard",
  description: "Add a new listing to 360Nepal.",
};

export default function AddListingPage() {
  return (
    <div className="py-4">
      <AddListingForm />
    </div>
  );
}
