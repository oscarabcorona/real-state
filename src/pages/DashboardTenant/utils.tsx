export const getStatusClass = (status: string) => {
  switch (status) {
    case "completed":
    case "signed":
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-red-100 text-red-800";
  }
};
