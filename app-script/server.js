const doGet = (e) => {
  const template = HtmlService.createTemplateFromFile("index")

  return template
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
}
