export function computeEarnings(booking: {
  dakshina?: number;
  travel?: number;
  food?: number;
  samagri?: number;
  dakshinaAmount?: number;
  travelAmount?: number;
  foodAllowance?: number;
  samagriAmount?: number;
}) {
  const dakshinaVal = booking.dakshina ?? booking.dakshinaAmount ?? 0;
  const travelVal = booking.travel ?? booking.travelAmount ?? 0;
  const foodVal = booking.food ?? booking.foodAllowance ?? 0;
  const samagriVal = booking.samagri ?? booking.samagriAmount ?? 0;

  const platformFee = Math.round(dakshinaVal * 0.15);
  const dakshinaNet = dakshinaVal - platformFee;
  const totalToPandit = dakshinaNet + travelVal + foodVal + samagriVal;

  return {
    platformFee,
    dakshinaNet,
    totalToPandit,
  };
}
