/**
 * @param  { string } to
 * @param  { boolean } isReplace
 */
export const navigate = (to, isReplace = false) => {
    const historyChangedEvent = new CustomEvent("historyChanged", {
        detail: { to, isReplace }
    });

    dispatchEvent(historyChangedEvent); // historyChanged 이벤트 발생
};
