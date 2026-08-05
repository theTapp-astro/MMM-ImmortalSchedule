/* Magic Mirror
 * Module: MMM-ImmortalSchedule
 *
 * Displays Immortal Martial Arts class schedule
 */

Module.register("MMM-ImmortalSchedule", {

    defaults: {
        apiUrl: "",

        updateInterval: 5 * 60 * 1000,

        favoriteClasses: [],

        showDate: true,
        showDay: true,
        showTime: true,
        showLocation: true,
        showCapacity: false,

        showHeader: true,
        showOnlyNextClass: false,
        maxClasses: 10
    },


    start: function() {
        Log.info("Starting module: " + this.name);

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


    socketNotificationReceived: function(notification, payload) {

        if (notification === "SCHEDULE_RESULT") {

            this.schedule = payload;
            this.loaded = true;

            this.updateDom(1000);
        }

    },


    getDom: function() {

        const wrapper = document.createElement("div");
        wrapper.className = "immortal-schedule";


        if (!this.loaded) {
            wrapper.innerHTML = "Loading schedule...";
            return wrapper;
        }


        if (!this.schedule || this.schedule.length === 0) {

            wrapper.innerHTML =
                "No upcoming classes";

            return wrapper;
        }


        if (this.config.showHeader) {

            const header = document.createElement("div");

            header.className =
                "bright medium";

            header.innerHTML =
                "🥋 Immortal Martial Arts";

            wrapper.appendChild(header);
        }


        let classes = this.schedule;


        if (this.config.showOnlyNextClass) {
            classes = classes.slice(0, 1);
        }


        classes =
            classes.slice(
                0,
                this.config.maxClasses
            );


        let currentDate = "";


        classes.forEach(classItem => {

            /*
             * Add date separator
             */

            if (
                this.config.showDate &&
                classItem.displayDate !== currentDate
            ) {

                currentDate = classItem.displayDate;

                const date =
                    document.createElement("div");

                date.className =
                    "normal small immortal-date";

                date.innerHTML =
                    classItem.displayDate;

                wrapper.appendChild(date);
            }


            const row =
                document.createElement("div");

            row.className =
                "immortal-class";


            /*
             * Time
             */

            const time =
                document.createElement("span");

            time.className =
                "bright small";

            time.innerHTML =
                classItem.start_time;


            row.appendChild(time);


            /*
             * Class name
             */

            const title =
                document.createElement("span");

            title.className =
                "medium";

            title.innerHTML =
                "&nbsp; " +
                classItem.title;


            row.appendChild(title);


            /*
             * Location
             */

            if (
                this.config.showLocation &&
                classItem.location
            ) {

                const location =
                    document.createElement("div");

                location.className =
                    "dimmed xsmall";

                location.innerHTML =
                    "📍 " +
                    classItem.location;

                row.appendChild(location);
            }


            /*
             * Capacity
             */

            if (
                this.config.showCapacity &&
                classItem.capacity
            ) {

                const capacity =
                    document.createElement("div");

                capacity.className =
                    "dimmed xsmall";

                capacity.innerHTML =
                    "👥 " +
                    classItem.capacity;

                row.appendChild(capacity);
            }


            wrapper.appendChild(row);

        });


        return wrapper;

    }

});
