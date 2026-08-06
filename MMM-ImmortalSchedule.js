/* MagicMirror²
 * Module: MMM-ImmortalSchedule
 *
 * Displays Immortal Martial Arts schedule
 */

Module.register("MMM-ImmortalSchedule", {

    defaults: {

        updateInterval: 5 * 60 * 1000,

        maxClasses: 20,

        showHeader: true

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


        if (this.config.showHeader) {

            const header =
                document.createElement("div");


            header.className =
                "immortal-header";


            header.innerHTML =
                "🥋 Immortal Martial Arts";


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
