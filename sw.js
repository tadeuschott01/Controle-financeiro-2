self.addEventListener("push", event => {
    let data = {};

    try {
        data = event.data ? event.data.json() : {};
    } catch (error) {
        data = {
            title: "ControleS",
            body: event.data ? event.data.text() : "Você tem um valor a receber."
        };
    }

    const title = data.title || "ControleS";

    const options = {
        body: data.body || "Você tem um valor a receber.",
        icon: "/Controle-financeiro-2/icon-192.png",
        badge: "/Controle-financeiro-2/icon-192.png",
        data: {
            url: data.url || "/Controle-financeiro-2/app.html"
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener("notificationclick", event => {
    event.notification.close();

    const url = event.notification.data?.url || "/Controle-financeiro-2/app.html";

    event.waitUntil(
        clients.matchAll({
            type: "window",
            includeUncontrolled: true
        }).then(clientList => {

            for (const client of clientList) {
                if ("focus" in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }

            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
