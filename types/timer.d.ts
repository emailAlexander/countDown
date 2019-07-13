interface TimerModel {
   id: string
   time: number
   pause?: number
   start?: number
   end?: number
   note: string
   handle?: number
   options: boolean
   notification: boolean
   sound: number
   volume: number
}
