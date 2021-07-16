import {Vector} from "./vector";

// https://www.geeksforgeeks.org/find-two-rectangles-overlap/
export function doOverlap(l1:Vector, r1:Vector, l2:Vector, r2:Vector) {

    if (l1.x == r1.x || l1.y == r1.y ||
        l2.x == r2.x || l2.y == r2.y) {
        // the line cannot have positive overlap
        return false;
    }

    // If one rectangle is on left side of other
    if (l1.x >= r2.x || l2.x >= r1.x) {
        return false;
    }

    // If one rectangle is above other
    if (l1.y >= r2.y || l2.y >= r1.y) {
        return false;
    }

    return true;
}