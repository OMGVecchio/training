const center = [115.25, 39.26];

mapboxgl.accessToken =
  "pk.eyJ1IjoidmVjY2hpbyIsImEiOiJja3JibWprdm00dTFiMnV0ZjkzYWtjc3Z4In0.iQTuZiNbWHcgKamU8RpF1A";

const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v11", // style URL
  center, // starting position [lng, lat]
  zoom: 8, // starting zoom
  pitch: 60, // 地图初始化时的倾角，按偏离屏幕水平面的度数计量（0-60）
  bearing: 60, // 地图初始化时的方位角（旋转角度），以正北方的逆时针转动度数计量
});

map.on("load", () => {
  /** 增加标注 */
  !(function () {
    const marker = new mapboxgl.Marker();
    marker.setLngLat([115.26, 39.27]).addTo(map);
  })();

  /** geojson 绘制点 */
  !(function () {
    map.loadImage(
      "https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png",
      (error, image) => {
        if (error) throw error;
        map.addImage("custom-marker", image);
        map.addSource("points", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [115.25, 39.26],
                },
                properties: {
                  title: "Where?",
                },
              },
            ],
          },
        });
        map.addLayer({
          id: "points",
          type: "symbol",
          source: "points",
          layout: {
            "icon-image": "custom-marker",
            "text-field": ["get", "title"],
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 1.25],
            "text-anchor": "top",
          },
        });
      }
    );
  })();

  /** geojson 绘制线 */
  !(function () {
    map.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [115.25, 39.26],
            [115.26, 39.27],
            [115.27, 39.28],
            [115.28, 39.29],
            [115.31, 40.1],
            [115.32, 40.2],
          ],
        },
      },
    });
    map.addLayer({
      id: "route",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "rgba(10, 10, 10, 0.5)",
        "line-width": 4,
      },
    });
  })();

  /** geojson 绘制面 */
  !(function () {
    map.addSource("polygon", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [115.25, 39.26],
              [115.25, 39],
              [115, 39],
              [115, 39.26],
              [115.25, 39.26],
            ],
          ],
        },
      },
    });
    map.addLayer({
      id: "polygon",
      type: "fill",
      source: "polygon",
      layout: {},
      paint: {
        "fill-color": "rgb(100, 100, 100)",
        "fill-opacity": 0.5,
      },
    });
  })();

  /** 绘制图片 */
  !(function () {
    map.addSource("radar", {
      type: "image",
      url: "https://docs.mapbox.com/mapbox-gl-js/assets/radar.gif",
      coordinates: [
        [115.25, 39.26],
        [116, 39.26],
        [116, 40],
        [115.25, 40],
      ],
    });
    map.addLayer({
      id: "radar-layer",
      type: "raster",
      source: "radar",
      paint: {
        "raster-fade-duration": 0,
      },
    });
  })();

  /** 绘制 3d-building */
  /** map.flyTo({ center: [-74.0066, 40.7135], zoom: 16 }) 查看效果 */
  !(function () {
    const layers = map.getStyle().layers;
    const labelLayerId = layers.find(
      (item) => item.type === "symbol" && item.layout["text-field"]
    ).id;
    map.addLayer(
      {
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 15,
        paint: {
          "fill-extrusion-color": "#aaa",

          // use an 'interpolate' expression to add a smooth transition effect to the
          // buildings as the user zooms in
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15,
            0,
            15.05,
            ["get", "height"],
          ],
          "fill-extrusion-base": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15,
            0,
            15.05,
            ["get", "min_height"],
          ],
          "fill-extrusion-opacity": 0.6,
        },
      },
      labelLayerId
    );
  })();

  /** 拉伸多边形绘制 3D室内图 */
  /** map.flyTo({ center: [-87.61694, 41.86625], zoom: 16 }) 查看效果 */
  !(function () {
    map.addLayer({
      id: "room-extrusion",
      type: "fill-extrusion",
      source: {
        // GeoJSON Data source used in vector tiles, documented at
        // https://gist.github.com/ryanbaumann/a7d970386ce59d11c16278b90dde094d
        type: "geojson",
        data: "https://docs.mapbox.com/mapbox-gl-js/assets/indoor-3d-map.geojson",
      },
      paint: {
        // See the Mapbox Style Specification for details on data expressions.
        // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions

        // Get the fill-extrusion-color from the source 'color' property.
        "fill-extrusion-color": ["get", "color"],

        // Get fill-extrusion-height from the source 'height' property.
        "fill-extrusion-height": ["get", "height"],

        // Get fill-extrusion-base from the source 'base_height' property.
        "fill-extrusion-base": ["get", "base_height"],

        // Make extrusions slightly opaque for see through indoor walls.
        "fill-extrusion-opacity": 0.5,
      },
    });
  })();

  /** 通过 TreeJS 加载 3D 模型 */
  /** map.zoomTo(17) 查看效果 */
  !(function () {
    // parameters to ensure the model is georeferenced correctly on the map
    const modelOrigin = center;
    const modelAltitude = 0;
    const modelRotate = [Math.PI / 2, 0, 0];
    const modelScale = 5.41843220338983e-8;

    // transformation parameters to position, rotate and scale the 3D model onto the map
    const modelTransform = {
      translateX: mapboxgl.MercatorCoordinate.fromLngLat(
        modelOrigin,
        modelAltitude
      ).x,
      translateY: mapboxgl.MercatorCoordinate.fromLngLat(
        modelOrigin,
        modelAltitude
      ).y,
      translateZ: mapboxgl.MercatorCoordinate.fromLngLat(
        modelOrigin,
        modelAltitude
      ).z,
      rotateX: modelRotate[0],
      rotateY: modelRotate[1],
      rotateZ: modelRotate[2],
      scale: modelScale,
    };

    const THREE = window.THREE;

    // configuration of the custom layer for a 3D model per the CustomLayerInterface
    const customLayer = {
      id: "3d-model",
      type: "custom",
      renderingMode: "3d",
      onAdd: function (map, gl) {
        this.camera = new THREE.Camera();
        this.scene = new THREE.Scene();

        // create two three.js lights to illuminate the model
        const directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(0, -70, 100).normalize();
        this.scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff);
        directionalLight2.position.set(0, 70, 100).normalize();
        this.scene.add(directionalLight2);

        // use the three.js GLTF loader to add the 3D model to the three.js scene
        const loader = new THREE.GLTFLoader();
        loader.load(
          "https://docs.mapbox.com/mapbox-gl-js/assets/34M_17/34M_17.gltf",
          function (gltf) {
            this.scene.add(gltf.scene);
          }.bind(this)
        );
        this.map = map;

        // use the Mapbox GL JS map canvas for three.js
        this.renderer = new THREE.WebGLRenderer({
          canvas: map.getCanvas(),
          context: gl,
        });

        this.renderer.autoClear = false;
      },
      render: function (gl, matrix) {
        const rotationX = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(1, 0, 0),
          modelTransform.rotateX
        );
        const rotationY = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(0, 1, 0),
          modelTransform.rotateY
        );
        const rotationZ = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(0, 0, 1),
          modelTransform.rotateZ
        );

        const m = new THREE.Matrix4().fromArray(matrix);
        const l = new THREE.Matrix4()
          .makeTranslation(
            modelTransform.translateX,
            modelTransform.translateY,
            modelTransform.translateZ
          )
          .scale(
            new THREE.Vector3(
              modelTransform.scale,
              -modelTransform.scale,
              modelTransform.scale
            )
          )
          .multiply(rotationX)
          .multiply(rotationY)
          .multiply(rotationZ);

        this.camera.projectionMatrix.elements = matrix;
        this.camera.projectionMatrix = m.multiply(l);
        this.renderer.state.reset();
        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint();
      },
    };

    map.addLayer(customLayer, 'waterway-label')
  })();
});
