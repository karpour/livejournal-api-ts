function appendImagesToPage(urls) {

    // Remove everything inside <html>
    document.documentElement.innerHTML = "";

    // Recreate a minimal valid document
    document.open();
    document.write("<!DOCTYPE html><html><head><title>Empty</title></head><body></body></html>");
    document.close();


    if (!Array.isArray(urls)) {
        throw new Error("Argument must be an array of image URLs");
    }

    let container = document.getElementById("__bulk_image_container__");
    if (!container) {
        container = document.createElement("div");
        container.id = "__bulk_image_container__";
        container.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 10px;
      padding: 10px;
      background: #111;
    `;
        document.body.prepend(container);
    }

    urls.forEach((url, i) => {
        const img = document.createElement("img");
        img.src = url;
        img.alt = url;
        container.appendChild(img);
    });
}

function ap(imgs) {
    appendImagesToPage(imgs.split("\n"));
}