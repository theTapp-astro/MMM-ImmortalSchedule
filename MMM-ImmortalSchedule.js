/* MagicMirror²
 * Module: MMM-ImmortalSchedule
 */

Module.register("MMM-ImmortalSchedule", {

    defaults: {
        companyId: 7491,

        sources: [],

        updateInterval: 86400000, //24 hours

        hidePastClasses: true,

        showHeader: true,
        showDate: true,
        showTime: true,
        showLocation: true,
        showCapacity: false,

        maxClasses: 20
    },

    start: function () {

        Log.info("Starting " + this.name);

        this.schedule = [];
        this.loaded = false;

        this.getSchedule();

        setInterval(() => {
            this.getSchedule();
        }, this.config.updateInterval);
    },

    getSchedule: function () {

        this.sendSocketNotification(
            "GET_SCHEDULE",
            this.config
        );

    },

    socketNotificationReceived: function (notification, payload) {

        if (notification === "SCHEDULE_RESULT") {

            this.schedule = payload;
            this.loaded = true;

            this.updateDom(500);

        }

    },

    getStyles: function () {
        return ["styles.css"];
    },

    getDom: function () {

        const wrapper = document.createElement("div");

        wrapper.className = "immortal-schedule";

        if (!this.loaded) {

            wrapper.innerHTML = "Loading class schedule...";
            return wrapper;

        }

        if (!this.schedule.length) {

            wrapper.innerHTML = "No upcoming classes";
            return wrapper;

        }

        if (this.config.showHeader) {

            const header = document.createElement("header");
            header.innerHTML = "🥋 Immortal Martial Arts";
            wrapper.appendChild(header);

        }

        let lastDate = "";

        this.schedule
            .slice(0, this.config.maxClasses)
            .forEach(item => {

                if (
                    this.config.showDate &&
                    item.displayDate !== lastDate
                ) {

                    lastDate = item.displayDate;

                    const dateHeader = document.createElement("div");
                    dateHeader.className = "immortal-date";
                    dateHeader.innerHTML = item.displayDate;

                    wrapper.appendChild(dateHeader);

                }

                const row = document.createElement("div");
                row.className = "immortal-class";

                const time = document.createElement("div");
                time.className = "bright small";
                time.innerHTML = item.start_time;

                row.appendChild(time);

                const title = document.createElement("div");
                title.className = "medium";
                title.innerHTML = item.title;

                row.appendChild(title);

                if (this.config.showLocation && item.location) {

                    const location = document.createElement("div");
                    location.className = "dimmed xsmall";
                    location.innerHTML = "📍 " + item.location;

                    row.appendChild(location);

                }

                if (this.config.showCapacity && item.capacity) {

                    const capacity = document.createElement("div");
                    capacity.className = "dimmed xsmall";
                    capacity.innerHTML = "👥 " + item.capacity;

                    row.appendChild(capacity);

                }

                wrapper.appendChild(row);

            });

        return wrapper;

    }

});
