{
    module: "MMM-ImmortalSchedule",
    position: "top_left",
    header: "Immortal Martial Arts",

    config: {

        // Refresh every 5 minutes
        updateInterval: 86400000, //every 24 hours

        // Your MyStudio company ID
        companyId: 7491,

        // Individual class schedule sources
        sources: [

            {
                appointmentFor: "I",
                classAppointmentId: 23342
            },

            {
                appointmentFor: "I",
                classAppointmentId: 23355
            }

            // Add more classes here if desired:
            // {
            //     appointmentFor: "I",
            //     classAppointmentId: 12345
            // }

        ],

        // Display options
        hidePastClasses: true,
        showHeader: true,
        showDate: true,
        showTime: true,
        showLocation: true,
        showCapacity: false,

        // Maximum number of classes to display
        maxClasses: 20
    }
},
