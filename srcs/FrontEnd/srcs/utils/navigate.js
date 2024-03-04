/**
 * @param { string } to
 * @param { Object } data
 */
export const navigate = (to, data = null) => {
    const historyChangedEvent = new CustomEvent("historyChanged", { detail: { to, data } });
    dispatchEvent(historyChangedEvent); // historyChanged 이벤트 발생
};
