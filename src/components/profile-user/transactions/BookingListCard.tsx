import { Transactions } from "@/types/transaction"

interface BookingListCardProps {
    bookings: Transactions
}

const bookingStatusStyles = {
    upcoming : "bg-blue-100 text-blue-800",
    completed : "bg-green-100 text-green-800",
    cancelled : "bg-red-100 text-red-800",
    expired: "bg-gray-100 text-gray-800",
} as const;

const BookingListCard = ({bookings} : BookingListCardProps) => {

  return (
    <div>BookingListCard</div>
  )
}

export default BookingListCard