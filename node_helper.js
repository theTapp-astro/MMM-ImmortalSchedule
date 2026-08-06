const NodeHelper = require("node_helper");
const axios = require("axios");

module.exports = NodeHelper.create({

    start() {
        console.log("MMM-ImmortalSchedule helper started");
    },


    socketNotificationReceived(notification, config) {

        if (notification === "GET_SCHEDULE") {
            this.getSchedule(config);
        }

    },


    async getSchedule(config) {

        try {

            const today = this.getTodayString();

            const requests = config.sources.map(source => {

                const params = new URLSearchParams({

                    appointment_for: source.appointmentFor || "I",
                    appointmentdate: today,
                    automation_recaptcha_enabled: "Y",
                    cancel_rescheduler_flag: "false",
                    class_appointment_id: source.classAppointmentId,
                    class_scheduler_verion: "2",
                    companyid: config.companyId,
                    current_date: today,
                    end: "100",
                    first_entry: "true",
                    individual_type: "N",
                    limit: "100",
                    mobile_flag: "N",
                    reg_type_user: "U",
                    start: "0",
                    studentid: "0",
                    token: "",
                    user_login_type: "",
                    waitlist_display: "Y"

                });


                const url =
                    "https://cp.mystudio.io/Api/v2/getClassAppointmentDetails?" +
                    params.toString();


                console.log("Fetching:", url);


                return axios.get(url);

            });


            const responses = await Promise.all(requests);


            let classes = [];


responses.forEach(response => {

    if (
        response.data &&
        Array.isArray(response.data.msg)
    ) {

        console.log(
            "Received",
            response.data.msg.length,
            "classes"
        );

        classes.push(
            ...response.data.msg
        );

    }

});


            // Remove duplicate occurrences

            const unique = new Map();

            classes.forEach(item => {

                if (item.class_appointment_occurrence_id) {

                    unique.set(
                        item.class_appointment_occurrence_id,
                        item
                    );

                }

            });


            classes = Array.from(unique.values());



            // Convert API response

            classes = classes.map(item => {


                const timestamp =
                    this.parseDateTime(
                        item.class_appointment_date,
                        item.start_time
                    );


                if (!timestamp) {

                    console.log(
                        "Skipping invalid class:",
                        item.class_appointment_title
                    );

                    return null;

                }


                return {

                    title:
                        item.class_appointment_title || "Class",

                    start_time:
                        item.start_time || "",

                    end_time:
                        item.end_time || "",

                    location:
                        item.class_appointment_location || "",

                    capacity:
                        item.capacity_flag === "Y"
                            ? `${item.actual_registered_count}/${item.capacity_value}`
                            : "",

                    timestamp:
                        timestamp.getTime()

                };

            });



            // Remove invalid entries

            classes = classes.filter(
                item => item !== null
            );


        /*
            // Remove past classes --CURRENTLY  REMOVED

            if (config.hidePastClasses !== false) {

                const now =
                    new Date().getTime();


                classes =
                    classes.filter(item =>
                        item.timestamp >= now
                    );

            }
            */


            // Sort chronologically

            classes.sort(
                (a, b) =>
                    a.timestamp - b.timestamp
            );



            // Limit results

            if (config.maxClasses) {

                classes =
                    classes.slice(
                        0,
                        config.maxClasses
                    );

            }



            console.log(
                "Sending",
                classes.length,
                "classes"
            );


            this.sendSocketNotification(
                "SCHEDULE_RESULT",
                classes
            );


        }
        catch(error) {

            console.error(
                "MMM-ImmortalSchedule:",
                error
            );


            this.sendSocketNotification(
                "SCHEDULE_RESULT",
                []
            );

        }

    },



    getTodayString() {

        const date = new Date();


        return (
            date.getFullYear() +
            "-" +
            String(date.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(date.getDate()).padStart(2, "0")
        );

    },



    parseDateTime(date, time) {


        if (!date || !time) {

            console.log(
                "Missing date/time",
                date,
                time
            );

            return null;

        }


        const dateParts =
            date.split("-");


        if (dateParts.length !== 3) {

            console.log(
                "Bad date format:",
                date
            );

            return null;

        }


        const timeMatch =
            time.match(
                /(\d+):(\d+)\s*(AM|PM)/
            );


        if (!timeMatch) {

            console.log(
                "Bad time format:",
                time
            );

            return null;

        }


        let hour =
            Number(timeMatch[1]);


        const minute =
            Number(timeMatch[2]);


        const ampm =
            timeMatch[3];


        if (
            ampm === "PM" &&
            hour !== 12
        ) {

            hour += 12;

        }


        if (
            ampm === "AM" &&
            hour === 12
        ) {

            hour = 0;

        }


        return new Date(
            Number(dateParts[0]),
            Number(dateParts[1]) - 1,
            Number(dateParts[2]),
            hour,
            minute
        );

    }


});
