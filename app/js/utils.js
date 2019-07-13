export class Utils {
    static parseTime(input) {
        let itime = input.split("").reverse().join("");
        let rtime = itime.replace(/(\d{2})\D*/g, "$1n");
        let ntime = rtime.split("").reverse().join("");
        let stime = ntime.split(/:|n|½/);
        if (stime.length == 5) {
            stime[1] = stime[0] + stime[1];
            stime = stime.slice(1, 5);
        }
        let ms = 0;
        let ss = [1000, 60000, 3600000, 86400000];
        let si = 0;
        for (var i = stime.length - 1; i >= 0; i--) {
            ms += +stime[i] * ss[si++];
            if (si == 4)
                break;
        }
        ;
        return ms;
    }
    static convertTime(ms) {
        return new Date(ms).toJSON().replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d{3})Z/, function (match, p1, p2, p3, p4, p5, p6, p7) {
            let days = Math.floor(ms / (3600 * 24 * 1000));
            let daystring = (days == 0) ? " " : days;
            return daystring + " " + p4 + ":" + p5 + ":" + p6;
        });
    }
}
