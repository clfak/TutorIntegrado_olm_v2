import { useState, useEffect } from "react";
import { AlertStatus } from "../types.d";

export const useAlert = (timerDuration: number) => {
  const [alertTitle, setTitle] = useState("");
  const [alertStatus, setStatus] = useState(AlertStatus.success);
  const [alertMsg, setMsg] = useState("");
  const [alertHidden, setAlertHidden] = useState(true);
  const [alertTimer, setAlertTimer] = useState(timerDuration);
  useEffect(() => {
    if (alertTimer) {
      const timer = setTimeout(() => {
        alertTimer !== null && setAlertHidden(true);
      }, alertTimer);
      return () => {
        clearTimeout(timer);
      };
    } else {
      setAlertHidden(false);
    }
  }, [alertHidden, alertTimer]);
  // funcion que despliega la alerta
  const showAlert = (
    newTitle: string,
    newStatus: AlertStatus,
    newMsg: string,
    newTimer?: number | null, // permite establecer temporizador especifico para una alerta,
    // si es null la alerta no tiene temporizador
  ) => {
    setTitle(newTitle);
    setStatus(newStatus);
    setMsg(newMsg);
    setAlertHidden(false);
    newTimer !== undefined && setAlertTimer(newTimer);
  };
  const resetAlert = () => {
    setTitle("");
    setStatus(AlertStatus.success);
    setMsg("");
    setAlertHidden(true);
    setAlertTimer(timerDuration);
  };
  return { alertTitle, alertStatus, alertMsg, alertHidden, showAlert, resetAlert };
};
