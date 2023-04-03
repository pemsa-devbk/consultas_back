export const getPercentaje = (quantity: number, total: number) => {
    const percentage = ((quantity * 100) / total);
    return {
        percentage,
        valueToGrap: Math.floor((percentage * 50) / 100),
        total: quantity
    }
}