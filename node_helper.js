/* Magic Mirror
 * Module: MMM-ImmortalSchedule
 *
 * Fetches class schedule data from MyStudio
 */

const NodeHelper = require("node_helper");
const axios = require("axios");


module.exports = NodeHelper.create({

    start: function() {
        console.log("MMM-ImmortalSchedule helper started");
    },


    socketNotificationReceived: function(notification, config) {

        if (notification === "GET_SCHEDULE") {
            this.getSchedule(config);
        }

    },


    getSchedule: async function(config) {

        try {

                const response = await axios.get(
                config.apiUrl
            );


            if (
                !response.data ||
                !response.data.msg
            ) {

                console.error(
                    "MMM-ImmortalSchedule: Invalid API response"
                );

                this.sendSocketNotification(
                    "SCHEDULE_RESULT",
                    []
                );

                return;
            }


            let classes = response.data.msg;


            /*
             * Filter favorite classes
             *
             * Empty array means show everything
             */

            if (
                config.favoriteClasses &&
                config.favoriteClasses.length > 0
            ) {

                classes = classes.filter(item =>
                    config.favoriteClasses.includes(
                        item.class_appointment_title
                    )
                );

            }


            /*
             * Convert API response
             * into simpler objects
             */

            classes = classes.map(item => {

                return {

                    title:
                        item.class_appointment_title,

                    date:
                        item.class_appointment_date,

                    start_time:
                        item.start_time,

                    end_time:
                        item.end_time,

                    timestamp:
                        this.parseDateTime(
                            item.class_appointment_date,
                            item.start_time
                        )

                };

            });


            /*
             * Sort chronologically
             */

            classes.sort((a, b) =>
                a.timestamp - b.timestamp
            );


            /*
             * Limit results
             */

            if (config.maxClasses) {

                classes =
                    classes.slice(
                        0,
                        config.maxClasses
                    );

            }


            /*
             * Add display date
             */

            classes.forEach(item => {

                item.displayDate =
                    this.formatDate(
                        item.timestamp
                    );

            });


            this.sendSocketNotification(
                "SCHEDULE_RESULT",
                classes
            );


        } catch(error) {

            console.error(
                "MMM-ImmortalSchedule error:",
                error.message
            );


            this.sendSocketNotification(
                "SCHEDULE_RESULT",
                []
            );

        }

    },


    parseDateTime: function(date, time) {

        /*
         * API gives:
         *
         * 2026-08-06
         * 06:00 PM
         */

        return new Date(
            `${date} ${time}`
        );

    },


    formatDate: function(date) {

        const today =
            new Date();


        const tomorrow =
            new Date();

        tomorrow.setDate(
            tomorrow.getDate() + 1
        );


        if (
            date.toDateString() ===
            today.toDateString()
        ) {

            return "TODAY";

        }


        if (
            date.toDateString() ===
            tomorrow.toDateString()
        ) {

            return "TOMORROW";

        }


        return date.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "short",
                day: "numeric"
            }
        );

    }

});
