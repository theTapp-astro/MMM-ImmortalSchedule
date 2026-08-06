const NodeHelper = require("node_helper");
const axios = require("axios");

module.exports = NodeHelper.create({

    start() {
        console.log("MMM-ImmortalSchedule helper started");
    },

    socketNotificationReceived(notification, payload) {

        if (notification === "GET_SCHEDULE") {
            this.getSchedule(payload);
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
                    limit: "7",
                    mem_billing_days: "",
                    mem_end_date: "",
                    mem_start_date: "",
                    mobile_flag: "N",
                    reg_type_user: "U",
                    staff_id: "",
                    start: "0",
                    student_token: "",
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
                    response.data.status === "Success" &&
                    Array.isArray(response.data.msg)
                ) {

                    classes.push(...response.data.msg);

                }

            });

            //
            // Remove duplicates
            //

            const unique = new Map();

            classes.forEach(c => {
                unique.set(c.class_appointment_occurrence_id, c);
            });

            classes = [...unique.values()];

            //
            // Convert objects
            //

            classes = classes.map(c => {

                const timestamp = this.parseDateTime(
                    c.class_appointment_date,
                    c.start_time
                );

                return {

                    title: c.class_appointment_title,

                    start_time: c.start_time,

                    end_time: c.end_time,

                    location: c.class_appointment_location,

                    capacity:
                        c.capacity_flag === "Y"
                            ? `${c.actual_registered_count} / ${c.capacity_value}`
                            : "",

                    timestamp,

                    displayDate: this.formatDate(timestamp)

                };

            });

            //
            // Hide past classes
            //

            if (config.hidePastClasses) {

                const now = new Date();

                classes = classes.filter(c => c.timestamp >= now);

            }

            //
            // Sort
            //

            classes.sort((a, b) => a.timestamp - b.timestamp);

            //
            // Limit
            //

            if (config.maxClasses) {

                classes = classes.slice(0, config.maxClasses);

            }

            console.log(
                `Sending ${classes.length} classes to frontend`
            );

            this.sendSocketNotification(
                "SCHEDULE_RESULT",
                classes
            );

        }
        catch (err) {

            console.error(err);

            this.sendSocketNotification(
                "SCHEDULE_RESULT",
                []
            );

        }

    },

    getTodayString() {

        const d = new Date();

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;

    },

    parseDateTime(date, time) {

        const [year, month, day] = date.split("-").map(Number);

        let [clock, ampm] = time.split(" ");

        let [hour, minute] = clock.split(":").map(Number);

        if (ampm === "PM" && hour !== 12) hour += 12;
        if (ampm === "AM" && hour === 12) hour = 0;

        return new Date(
            year,
            month - 1,
            day,
            hour,
            minute,
            0
        );

    },

    formatDate(date) {

        const today = new Date();
        const tomorrow = new Date();

        tomorrow.setDate(today.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return "TODAY";
        }

        if (date.toDateString() === tomorrow.toDateString()) {
            return "TOMORROW";
        }

        return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric"
        });

    }

});
