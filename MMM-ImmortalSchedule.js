/* MagicMirror²
 * Module: MMM-ImmortalSchedule
 *
 * Displays Immortal Martial Arts schedule
 */

Module.register("MMM-ImmortalSchedule", {

    defaults: {
        updateInterval: 5 * 60 * 1000,

        maxClasses: 20,

        showHeader: true,

        // "full" = normal multi-day schedule
        // "today" = today's schedule only
        viewMode: "full",

        // Header/title used by today's view
        todayTitle: "Today's Immortal Schedule"

    },


    start() {

        Log.info("Starting " + this.name);

        this.schedule = [];

        this.loaded = false;


        this.getSchedule();


        setInterval(() => {

            this.getSchedule();

        }, this.config.updateInterval);
    },


    getSchedule() {

        this.sendSocketNotification(
            "GET_SCHEDULE",
            this.config
        );

    },


    socketNotificationReceived(notification, payload) {

        if (notification !== "SCHEDULE_RESULT") {
            return;
        }


        this.schedule = payload;

        this.loaded = true;

        this.updateDom(300);

    },


    getStyles() {

        return [
            "styles.css"
        ];

    },


    getDom() {

        const wrapper =
            document.createElement("div");


        wrapper.className =
            "immortal-schedule";


        if (!this.loaded) {

            wrapper.innerHTML =
                "Loading class schedule...";

            return wrapper;
        }


        if (!this.schedule || this.schedule.length === 0) {

            wrapper.innerHTML =
                "No upcoming classes";

            return wrapper;
        }


        /*
         * Today's compact view
         */
        if (this.config.viewMode === "today") {

            return this.getTodayView(wrapper);

        }


        /*
         * Normal full schedule view
         */
        if (this.config.showHeader) {

            const header =
                document.createElement("div");


            header.className =
                "immortal-header";


            header.innerHTML =
                "🥊 <u>Immortal Martial Arts Schedule</u>";


            wrapper.appendChild(header);

        }


        /*
         * Group classes by date + class name
         * Combine multiple times into one line
         */
        const grouped = {};


        this.schedule.forEach(item => {

            const date =
                this.formatDate(item.timestamp);


            const title =
                this.formatTitle(item.title);


            const key =
                `${date}|${title}`;


            if (!grouped[key]) {

                grouped[key] = {

                    date: date,

                    title: title,

                    times: []

                };

            }


            grouped[key].times.push(
                item.startTime
            );

        });


        Object.values(grouped)
            .slice(0, this.config.maxClasses)
            .forEach(item => {


                const row =
                    document.createElement("div");


                row.className =
                    "immortal-row";


                row.textContent =
                    `${item.date}: ${item.title} -> ${item.times.join(" or ")}`;


                wrapper.appendChild(row);

            });


        return wrapper;

    },


    /*
     * Compact view showing only today's classes.
     *
     * Example:
     *
     * Today's Immortal Schedule: MT Kickboxing -> 6:00 PM
     */
    getTodayView(wrapper) {

        const today =
            new Date();


        const todayYear =
            today.getFullYear();

        const todayMonth =
            today.getMonth();

        const todayDay =
            today.getDate();


        const todayClasses =
            this.schedule.filter(item => {

                const date =
                    new Date(item.timestamp);


                return (
                    date.getFullYear() === todayYear &&
                    date.getMonth() === todayMonth &&
                    date.getDate() === todayDay
                );

            });


        const title =
            document.createElement("div");


        title.className =
            "immortal-today-header";


        title.textContent =
            this.config.todayTitle;


        wrapper.appendChild(title);


        if (todayClasses.length === 0) {

            const empty =
                document.createElement("div");


            empty.className =
                "immortal-today-empty";


            empty.textContent =
                "No classes today";


            wrapper.appendChild(empty);

            return wrapper;

        }


        /*
         * Group today's classes by class name.
         */
        const grouped = {};


        todayClasses.forEach(item => {

            const title =
                this.formatTitle(item.title);


            if (!grouped[title]) {

                grouped[title] = [];

            }


            grouped[title].push(item.startTime);

        });


        Object.entries(grouped)
            .forEach(([title, times]) => {

                const row =
                    document.createElement("div");


                row.className =
                    "immortal-today-row";


                row.textContent =
                    `${title} -> ${times.join(" or ")}`;


                wrapper.appendChild(row);

            });


        return wrapper;

    },


    formatTitle(title) {

        return title.replace(
            /Muay Thai/gi,
            "MT"
        );

    },


    formatDate(timestamp) {

        const date =
            new Date(timestamp);


        const weekday =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "long"
                }
            );


        const month =
            date.getMonth() + 1;


        const day =
            date.getDate();


        return `${weekday} (${month}/${day})`;

    }

});
