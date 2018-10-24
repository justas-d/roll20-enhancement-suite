// fit input to bounding box (bb) while maintaining scale

export const scaleToFit = (inputX: number, inputY: number, bbX: number, bbY: number): { x: number, y: number } => {
    const tangent = inputX / inputY;

    const tryX = tangent * bbY;

    if (tryX > bbX) {
        return {
            x: bbX,
            y: bbX / tangent
        }
    } else {
        return {
            x: tryX,
            y: bbY
        }
    }
};
