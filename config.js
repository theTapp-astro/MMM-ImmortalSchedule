{
    module: "MMM-ImmortalSchedule",
    position: "top_left",
    header: "Immortal Martial Arts",
    config: {
        // Public MyStudio API URL
        apiUrl: "https://cp.mystudio.io/Api/v2/getClassAppointmentDetails?appointment_for=H&class_scheduler_verion=2&companyid=7491&individual_type=N&limit=7&reg_type_user=U&studentid=0&token=&user_login_type=",

        // Refresh every 5 minutes
        updateInterval: 86400000, //Once per day

        // Leave empty to show ALL classes
        favoriteClasses: [
        ],

        // Display options
        showDate: true,
        showDay: true,
        showTime: true,
        showLocation: true,
        showCapacity: false,
        showInstructor: false,

        // Optional formatting
        showHeader: true,
        showOnlyNextClass: false,
        maxClasses: 10,

        // Date/time formatting
        timeFormat: "h:mm A",
        dateFormat: "ddd, MMM D",

        // CSS class names for easy styling
        classes: {
            title: "bright medium",
            time: "light small",
            location: "dimmed xsmall",
            date: "normal small"
        }
    }
},
