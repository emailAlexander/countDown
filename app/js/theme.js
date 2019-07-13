export class Theme {
    static Set(id) {
        let theme = Theme.themes[id];
        for (let index = 0; index < theme.values.length; index++) {
            const element = theme.values[index];
            document.documentElement.style.setProperty(element[0], element[1]);
        }
        Theme.id = id;
    }
    static Change() {
        let id = (Theme.id + 1) % Theme.themes.length;
        Theme.Set(id);
        chrome.storage.sync.set({ 'themeIndex': id });
    }
}
Theme.themes = [
    { name: "blue", values: [
            ["--dark-primary-color", "#0288D1"],
            ["--default-primary-color", "#03A9F4"],
            ["--light-primary-color", "#B3E5FC"],
            ["--text-primary-color", "#FFFFFF"],
            ["--accent-color", "#FFEB3B"],
            ["--primary-background-color", "#B3E5FC"],
            ["--primary-text-color", "#212121"],
            ["--secondary-text-color", "#757575"],
            ["--disabled-text-color", "#BDBDBD"],
            ["--divider-color", "#BDBDBD"]
        ] },
    { name: "noir", values: [
            ["--dark-primary-color", "#f2f4f6"],
            ["--default-primary-color", "#FFFFFF"],
            ["--light-primary-color", "#202020"],
            ["--text-primary-color", "#212121"],
            ["--accent-color", "#212121"],
            ["--primary-background-color", "#B3E5FC"],
            ["--primary-text-color", "#212121"],
            ["--secondary-text-color", "#757575"],
            ["--disabled-text-color", "#BDBDBD"],
            ["--divider-color", "#BDBDBD"]
        ] },
    { name: "grey", values: [
            ["--dark-primary-color", "#6f6f6f"],
            ["--default-primary-color", "#888888"],
            ["--light-primary-color", "#FFFFFF"],
            ["--text-primary-color", "#FFFFFF"],
            ["--accent-color", "#FFFFFF"],
            ["--primary-background-color", "#B3E5FC"],
            ["--primary-text-color", "#212121"],
            ["--secondary-text-color", "#757575"],
            ["--disabled-text-color", "#BDBDBD"],
            ["--divider-color", "#BDBDBD"]
        ] },
    { name: "dark", values: [
            ["--dark-primary-color", "#111111"],
            ["--default-primary-color", "#212121"],
            ["--light-primary-color", "#E64A19"],
            ["--text-primary-color", "#FFFFFF"],
            ["--accent-color", "#E64A19"],
            ["--primary-background-color", "#B3E5FC"],
            ["--primary-text-color", "#212121"],
            ["--secondary-text-color", "#757575"],
            ["--disabled-text-color", "#BDBDBD"],
            ["--divider-color", "#BDBDBD"]
        ] },
    { name: "red", values: [
            ["--dark-primary-color", "#D32F2F"],
            ["--default-primary-color", "#F44336"],
            ["--light-primary-color", "#FFCDD2"],
            ["--text-primary-color", "#FFFFFF"],
            ["--accent-color", "#FFFFFF"],
            ["--primary-background-color", "#B3E5FC"],
            ["--primary-text-color", "#212121"],
            ["--secondary-text-color", "#757575"],
            ["--disabled-text-color", "#BDBDBD"],
            ["--divider-color", "#BDBDBD"]
        ] }
];
Theme.id = 0;
