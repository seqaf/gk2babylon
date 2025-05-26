var canvas = document.getElementById("renderCanvas");

// Cegah duplikasi engine jika di-run ulang
if (!window.engine) {
    window.engine = new BABYLON.Engine(canvas, true);
}
const engine = window.engine;

var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.8, 0.9, 1);

    var camera = new BABYLON.ArcRotateCamera("ArcCamera",
        BABYLON.Tools.ToRadians(-90),
        BABYLON.Tools.ToRadians(70),
        20.0, new BABYLON.Vector3(0, 1, 0), scene);
    camera.attachControl(canvas, true);

    var dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
    dirLight.position = new BABYLON.Vector3(20, 40, 20);
    dirLight.intensity = 1.2;

    var hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.4;

    var shadowGenerator = new BABYLON.ShadowGenerator(2048, dirLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;

    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 10 }, scene);
    ground.receiveShadows = true;
    var roadMat = new BABYLON.StandardMaterial("roadMat", scene);
    roadMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    ground.material = roadMat;

    var redMat = new BABYLON.StandardMaterial("redMat", scene);
    redMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
    var glassMat = new BABYLON.StandardMaterial("glassMat", scene);
    glassMat.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.8);
    glassMat.alpha = 0.6;
    var wheelMat = new BABYLON.StandardMaterial("wheelMat", scene);
    wheelMat.diffuseColor = new BABYLON.Color3.Black();

    var body = BABYLON.MeshBuilder.CreateBox("body", { width: 4, height: 1, depth: 2 }, scene);
    body.position.y = 1;
    body.material = redMat;

    var cabin = BABYLON.MeshBuilder.CreateBox("cabin", { width: 2, height: 0.6, depth: 1.4 }, scene);
    cabin.position.y = 1.6;
    cabin.position.x = -0.5;
    cabin.material = glassMat;

    function createWheel(x, z) {
        var wheel = BABYLON.MeshBuilder.CreateCylinder("wheel", {
            diameter: 1, height: 0.5, tessellation: 24
        }, scene);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(x, 0.5, z);
        wheel.material = wheelMat;
        return wheel;
    }

    var wheels = [
        createWheel(-1.5, -1),
        createWheel(1.5, -1),
        createWheel(-1.5, 1),
        createWheel(1.5, 1),
    ];

    var car = BABYLON.Mesh.MergeMeshes([body, cabin, ...wheels], true, false, null, false, true);
    car.position = new BABYLON.Vector3(-40, 0, 0);
    car.isPickable = true;
    shadowGenerator.addShadowCaster(car);

    let speed = 0.05;
    const minSpeed = 0.01;
    const maxSpeed = 0.3;

    scene.onBeforeRenderObservable.add(() => {
        car.position.x += speed;
        if (car.position.x > 40) {
            car.position.x = -40;
        }
    });

    // Kontrol keyboard: W = tambah cepat, S = tambah pelan
    window.addEventListener("keydown", (event) => {
        const key = event.key.toLowerCase();
        if (key === "w") {
            speed = Math.min(speed * 1.2, maxSpeed);
        } else if (key === "s") {
            speed = Math.max(speed * 0.8, minSpeed);
        }
    });

    return scene;
};

var scene = createScene();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
