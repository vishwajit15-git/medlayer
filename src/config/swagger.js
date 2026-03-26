const swaggerJsdoc = require("swagger-jsdoc");

const options={
  definition:{
    openapi:"3.0.0",
    info:{
      title:"MedLayer API",
      version:"1.0.0",
      description:"Clinic Management SaaS Backend"
    },
    servers:[
      {
        url:"http://localhost:8080"
      }
    ],
    components:{
      securitySchemes:{
        bearerAuth:{
          type:"http",
          scheme:"bearer",
          bearerFormat:"JWT"
        }
      },

      schemas:{
        Doctor:{
          type:"object",
          required: ["name", "specialization", "availability"],
          properties:{
            name:{ type: "string", example: "Dr Ben Tennyson" },
            specialization:{ type: "string", example: "Cardiology" },
            availability:{
              type:"array",
              items:{
                type:"object",
                properties:{
                  startTime:{ type: "string", example: "09:00" },
                  endTime:{ type: "string", example: "13:00" }
                }
              }
            }
          }
        },

        Patient:{
          type:"object",
          required:["name"],
          properties:{
            name:{ type: "string", example: "Kevin Levin" },
            age:{ type: "number", example: 22 }
          }
        },

        Appointment:{
          type:"object",
          required:["doctorId", "patientId", "appointmentDate", "appointmentTime"],
          properties:{
            doctorId:{ type: "string", example: "64abc..." },
            patientId:{ type: "string", example: "64abc..." },
            appointmentDate:{ type: "string", example: "2026-03-30" },
            appointmentTime:{ type: "string", example: "10:00" }
          }
        },

        DoctorBreak:{
          type:"object",
          required:["doctorId", "date", "startTime", "endTime"],
          properties:{
            doctorId:{type:"string"},
            date:{ type:"string",example:"2026-03-30"},
            startTime:{ type: "string", example:"11:00"},
            endTime:{ type:"string", example:"12:00"}
          }
        },

        DoctorHoliday:{
          type:"object",
          required: ["doctorId","date"],
          properties:{
            doctorId:{type:"string"},
            date:{type:"string", example:"2026-03-31"}
          }
        },

        ClinicSettings:{
          type:"object",
          properties:{
            workingHours:{
              type:"object",
              properties:{
                startTime:{type:"string",example:"09:00"},
                endTime:{ type:"string",example:"18:00"}
              }
            },
            settings:{
              type:"object",
              properties:{
                workingDays:{
                  type:"array",
                  items:{
                    type:"string",
                    example:"MON"
                  }
                }
              }
            }
          }
        },

        User: {
          type: "object",
          required:["email", "password", "role"],
          properties: {
            email:{type:"string", example:"test@mail.com"},
            password:{type:"string", example:"secure123"},
            role:{
              type:"string",
              enum:["admin", "doctor", "receptionist"]
            },
            doctorId:{ type:"string"}
          }
        }
      }
    },

    security:[
      {
        bearerAuth:[]
      }
    ]
  },

  apis: [
    "./src/routes/*.js",
    "./src/docs/*.js"
  ],

  tags:[
  {name:"Auth",description:"Authentication APIs"},
  {name:"Clinic",description:"Clinic settings & management"},
  {name:"Doctor",description:"Doctor management & schedule"},
  {name:"Patient",description:"Patient management"},
  {name:"Appointments",description:"Appointment lifecycle"},
  {name:"Admin",description:"Admin operations"}
  ],
};

module.exports = swaggerJsdoc(options);