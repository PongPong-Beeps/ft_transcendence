/**
 * @param  { string } to
 */
export const navigate = (to) => {
    const historyChangedEvent = new CustomEvent("historyChanged", {
        detail: { to }
    });

    dispatchEvent(historyChangedEvent); // historyChanged 이벤트 발생
};
