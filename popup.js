const wikiEscaper = ({ title, url }) => ({ title, url: url.replace(/([\[\]])/g, "\\$1") });
const htmlEscaper = ({ title, url }) => ({ title, url: url.replace(/"/g, '\\"') });

const htmlFormatter = ({ title, url }) => `<li><a href="${url}">${title}</a></li>`;

const escaper = {
  markdown: wikiEscaper,
  html: htmlEscaper,
  jira: wikiEscaper,
  wysiwyg: htmlEscaper
};

const formatter = {
  markdown: ({ title, url }) => `- [${title}](${url})`,
  html: htmlFormatter,
  jira: ({ title, url }) => `- [${title}|${url}]`,
  wysiwyg: htmlFormatter
};

const copy = kind => event => {
  event.preventDefault();

  chrome.tabs.query({ currentWindow: true }, tabs => {
    const el = document.createElement(kind === "wysiwyg" ? "div" : "textarea");

    el[kind === "wysiwyg" ? "innerHTML" : "value"] = tabs
      .map(({ title, url }) => ({ title, url }))
      .filter(({ title, url }) => title && url)
      .map(escaper[kind])
      .map(formatter[kind])
      .join("\n");

    if (kind === "html") {
      el.value = `<ul>\n${el.value}\n</ul>`;
    }

    document.body.appendChild(el);

    if (kind !== "wysiwyg") {
      el.select();
    } else {
      const range = document.createRange();
      const selection = document.getSelection();
      range.selectNode(el);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    document.execCommand("copy");
    document.body.removeChild(el);

    chrome.notifications.create(
      null,
      {
        type: "basic",
        iconUrl: "images/md128.png",
        title: "Tabs to markdown",
        message: `${tabs.length} links copied as ${kind}`,
        priority: 2,
        eventTime: Date.now()
      },
      () => window.close()
    );
  });
};

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", copy(button.innerText));
  });
});
