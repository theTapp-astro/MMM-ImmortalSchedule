/* MagicMirror²
 * Module: MMM-ImmortalSchedule
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

            const header = document.createElement("div");
            header.className = "immortal-header";
            header.innerHTML = "🥋 Immortal Martial Arts";

            wrapper.appendChild(header);

        }

        this.schedule.forEach(item => {

            const row = document.createElement("div");
            row.className = "immortal-row";

            row.textContent =
                `${this.formatDate(item.timestamp)}: ${item.title} at ${item.startTime}`;

            wrapper.appendChild(row);

        });

        return wrapper;

    },

    formatDate(timestamp) {

        return new Date(timestamp).toLocaleDateString(
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
