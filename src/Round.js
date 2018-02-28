function Round(value, precision = 0, mode = "ROUND_HALF_UP"){
    let m, f, isHalf, sgn;
    m = Math.pow(10, precision);
    value *= m;
    // sign of the number
    sgn = (value > 0) | -(value < 0);
    isHalf = value % 1 === 0.5 * sgn;
    f = Math.floor(value);
    if(isHalf){
        switch(mode){
            case "ROUND_HALF_DOWN":
                // rounds .5 toward zero
                value = f + (sgn < 0);
                break;
            case "ROUND_HALF_EVEN":
                // rounds .5 towards the next even integer
                value = f + (f % 2 * sgn);
                break;
            case "ROUND_HALF_ODD":
                // rounds .5 towards the next odd integer
                value = f + !(f % 2);
                break;
            default:
                // rounds .5 away from zero
                value = f + (sgn > 0);
        }
    }
    return ((isHalf ? value : Math.round(value)) / m);
}

module.exports = Round;