export function toTitle( string ) {
    if(  string.length === 0 || string === '' ) {
        return string;
    }

    if( string.length === 1 ) {
        return string.toUpperCase();
    }
    else {
        return string.slice(0, 1).toUpperCase() + '' + string.slice(1).toLowerCase();
    }
}