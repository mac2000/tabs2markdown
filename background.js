chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.query({ currentWindow: true }, tabs => {
    tabs = tabs.filter(({ url }) => url.indexOf("google.com") === -1 && url.indexOf("search") === -1);

    const el = document.createElement("textarea");
    el.value = tabs
      .map(({ title, url }) => ({ title, url }))
      .filter(({ title, url }) => title && url)
      .map(({ title, url }) => ({ title, url: url.replace(/([\[\]])/g, "\\$1") }))
      .map(({ title, url }) => `- [${title}](${url})`)
      .join("\n");
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);

    chrome.notifications.create(
      "copied",
      {
        type: "basic",
        iconUrl: "images/md128.png",
        title: "Tabs to markdown",
        message: `${tabs.length} links copied`
      },
      notificationId => {}
    );
  });
});
