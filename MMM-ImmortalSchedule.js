/* MagicMirror²
 * Module: MMM-ImmortalSchedule
 *
 * Displays Immortal Martial Arts schedule
 */

Module.register("MMM-ImmortalSchedule", {

    defaults: {

        updateInterval: 5 * 60 * 1000,

        hidePastClasses: true,

        showHeader: true,

        maxClasses: 20

    },


    start: function () {

        Log.info(
            "Starting " + this.name
        );

        this.schedule = [];

        this.loaded = false;


        this.sendSocketNotification(
            "GET_SCHEDULE",
            this.config
        );


        setInterval(() => {

            this.sendSocketNotification(
                "GET_SCHEDULE",
                this.config
            );

        }, this.config.updateInterval);

    },


    socketNotificationReceived: function (
        notification,
        payload
    ) {

        if (
            notification === "SCHEDULE_RESULT"
        ) {

            this.schedule = payload;

            this.loaded = true;

            this.updateDom(500);

        }

    },


    getStyles: function () {

        return [
            "styles.css"
        ];

    },


    getDom: function () {

        const wrapper =
            document.createElement("div");


        wrapper.className =
            "immortal-schedule";


        if (!this.loaded) {

            wrapper.innerHTML =
                "Loading class schedule...";

            return wrapper;

        }


        if (
            !this.schedule ||
            this.schedule.length === 0
        ) {

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


        this.schedule
            .slice(
                0,
                this.config.maxClasses
            )
            .forEach(item => {


                const line =
                    document.createElement("div");


                line.className =
                    "immortal-line";


                line.innerHTML =
                    `${this.formatDisplayDate(item.timestamp)}: ${item.title} at ${item.start_time}`;


                wrapper.appendChild(line);


            });


        return wrapper;

    },


    formatDisplayDate: function (date) {

        return date.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "numeric",
                day: "numeric",
                year: "2-digit"
            }
        );

    }


});
