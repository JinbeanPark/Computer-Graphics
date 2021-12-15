import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

export class Assignment3 extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            torus: new defs.Torus(15, 15),
            torus2: new defs.Torus(3, 15),
            sphere: new defs.Subdivision_Sphere(4),
            circle: new defs.Regular_2D_Polygon(1, 15),
            // TODO:  Fill in as many additional shape instances as needed in this key/value table.
            //        (Requirement 1)
            sun: new defs.Subdivision_Sphere(4),
            sphere1: new defs.Subdivision_Sphere(1),
            sphere2: new defs.Subdivision_Sphere(2),
            sphere3: new defs.Subdivision_Sphere(3),
            sphere4: new defs.Subdivision_Sphere(4),
            flatSphere1: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(1),
            flatSphere2: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(2),
            flatSphere3: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(3),
            flatSphere4: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(4),
        };

        // *** Materials
        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            test2: new Material(new Gouraud_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#992828")}),
            ring: new Material(new Ring_Shader()),
            // TODO:  Fill in as many additional material objects as needed in this key/value table.
            //        (Requirement 4)
            sun: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 0, specularity: 0, color: hex_color("#ff0000")}),
            planet1: new Material(new defs.Phong_Shader(),
                {ambient: 0, diffusivity: 1, specularity: 0, color: hex_color("#bec3c6")}),
            planet2Grud: new Material(new Gouraud_Shader(),
                {ambient: 0, diffusivity: .2, specularity: 1, color: hex_color("#092E2D")}),
            planet2Phong: new Material(new defs.Phong_Shader(),
                {ambient: 0, diffusivity: .2, specularity: 1, color: hex_color("#092E2D")}),
            planet3: new Material(new defs.Phong_Shader,
                {ambient: 0, diffusivity: 1, specularity: 1, color: color(0.71, 0.39, 0.11, 1)}),
            planet4: new Material(new defs.Phong_Shader(),
                {ambient: 0, specularity: 1, color: hex_color("#add8e6")}),
            moon: new Material(new defs.Phong_Shader(),
                {specularity: 1, color: hex_color("#90ee90")})
        }
        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("View solar system", ["Control", "0"], () => this.attached = () => "solar");
        this.new_line();
        this.key_triggered_button("Attach to planet 1", ["Control", "1"], () => this.attached = () => this.planet_1);
        this.key_triggered_button("Attach to planet 2", ["Control", "2"], () => this.attached = () => this.planet_2);
        this.new_line();
        this.key_triggered_button("Attach to planet 3", ["Control", "3"], () => this.attached = () => this.planet_3);
        this.key_triggered_button("Attach to planet 4", ["Control", "4"], () => this.attached = () => this.planet_4);
        this.new_line();
        this.key_triggered_button("Attach to moon", ["Control", "m"], () => this.attached = () => this.moon);
    }

    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }

        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, .1, 1000);

        // Set the camera position.
        if (this.attached !== undefined) {
            let desired = this.attached();

            if (desired === "solar") {
                desired = this.initial_camera_location;
            }
            else {
                desired = Mat4.inverse(desired.times(Mat4.translation(0, 0, 5)));
            }

            desired = desired.map((x, i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.1));
            program_state.set_camera(desired);
        }

        // TODO: Lighting (Requirement 2)
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        var sunRadius = 2 + (Math.sin(Math.PI * t * (0.2)));
        const light_position = vec4(0, 0, 0, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 10 ** (sunRadius))];

        // TODO:  Fill in matrix operations and drawing code to draw the solar system scene (Requirements 3 and 4)
        // Drawing Sun.
        var changedRed = 0.5 + 0.5 * (Math.sin(Math.PI * t * (0.2)));
        var changedBlue = 0.5 + -(0.5 * (Math.sin(Math.PI * t * (0.2))));
        var sunColor = color(changedRed, 0, changedBlue, 1);
        this.shapes.sun.draw(context, program_state, Mat4.scale(sunRadius, sunRadius, sunRadius).times(Mat4.translation(0, 0, 0)),
            this.materials.sun.override({color : sunColor}));

        // Drawing planet 1.
        let p1Transform = Mat4.rotation(t, 0, 1, 0).times(Mat4.translation(5, 0, 0));
        this.shapes.flatSphere2.draw(context, program_state, p1Transform, this.materials.planet1);

        // Drawing planet 2.
        let p2Transform = Mat4.rotation(t / 2, 0, 1, 0).times(Mat4.translation(8, 0, 0));
        if (t % 2 > 1)
            this.shapes.sphere3.draw(context, program_state, p2Transform, this.materials.planet2Grud);
        else
            this.shapes.sphere3.draw(context, program_state, p2Transform, this.materials.planet2Phong);

        // Drawing planet 3.
        let wobbleTransform = Mat4.rotation(0.5 * t, 1, 1, 0)
            .times(Mat4.translation(1,0,0));
        let p3Transform = Mat4.rotation(t / 4, 0, 1, 0)
            .times(Mat4.translation(11, 0, 0))
            .times(wobbleTransform);
        this.shapes.sphere4.draw(context, program_state, p3Transform, this.materials.planet3);

        // Drawing Ring.
        let torusTransform = p3Transform.times(Mat4.scale(3, 3, 0.1));
        this.shapes.torus.draw(context, program_state, torusTransform, this.materials.ring);

        // Drawing Planet 4.
        let p4Transform = Mat4.rotation(t / 8, 0, 1, 0).times(Mat4.translation(14, 0, 0));
        this.shapes.sphere4.draw(context, program_state, p4Transform, this.materials.planet4);

        // Drawing moon.
        let moonTransform = p4Transform.times(Mat4.rotation(t / 2, 0, 1, 0))
            .times(Mat4.translation(2, 0, 0))
            .times(Mat4.rotation(t, 0, 1, 0));
        this.shapes.flatSphere1.draw(context, program_state, moonTransform, this.materials.moon);

        // Camera buttons.
        this.planet_1 = p1Transform;
        this.planet_2 = p2Transform;
        this.planet_3 = p3Transform;
        this.planet_4 = p4Transform;
        this.moon = moonTransform;
    }
}

class Gouraud_Shader extends Shader {
    // This is a Shader using Phong_Shader as template
    // TODO: Modify the glsl coder here to create a Gouraud Shader (Planet 2)

    constructor(num_lights = 2) {
        super();
        this.num_lights = num_lights;
    }

    shared_glsl_code() {

        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********

        return ` 
        precision mediump float;
        const int N_LIGHTS = ` + this.num_lights + `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;

        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;
        
        varying vec4 vertexColor;
        
        // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                // light will appear directional (uniform direction from all points), and we 
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                // the point light's location from the current surface point.  In either case, 
                // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );

                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() +

            `attribute vec3 position, normal;
            // Position is expressed in object coordinates.
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;

            void main() {
            // The vertex's final resting place (in NDCS):
            gl_Position = projection_camera_model_transform * vec4(position, 1.0);
            // The final normal vector in screen space.
            N = normalize(mat3(model_transform) * normal / squared_scale);
            vertex_worldspace = (model_transform * vec4(position, 1.0)).xyz;
    
            // Compute an initial (ambient) color:
            vec4 vecColor = vec4(shape_color.xyz * ambient, shape_color.w);
            // Compute the final color with contributions from lights:
            vecColor.xyz += phong_model_lights(normalize(N), vertex_worldspace);
            vertexColor = vecColor;
            }`;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
            //attribute vec3 position, normal;
            // Position is expressed in object coordinates.
            //uniform mat4 model_transform;
            //uniform mat4 projection_camera_model_transform;
            void main() {
                gl_FragColor = vertexColor;
            }`;
    }

    send_material(gl, gpu, material) {
        // send_material(): Send the desired shape-wide material qualities to the
        // graphics card, where they will tweak the Phong lighting formula.
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    send_gpu_state(gl, gpu, gpu_state, model_transform) {
        // send_gpu_state():  Send the state of our whole drawing context to the GPU.
        const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
        gl.uniform3fv(gpu.camera_center, camera_center);
        // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
        const squared_scale = model_transform.reduce(
            (acc, r) => {
                return acc.plus(vec4(...r).times_pairwise(r))
            }, vec4(0, 0, 0, 0)).to3();
        gl.uniform3fv(gpu.squared_scale, squared_scale);
        // Send the current matrices to the shader.  Go ahead and pre-compute
        // the products we'll need of the of the three special matrices and just
        // cache and send those.  They will be the same throughout this draw
        // call, and thus across each instance of the vertex shader.
        // Transpose them since the GPU expects matrices as column-major arrays.
        const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
        gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Omitting lights will show only the material color, scaled by the ambient term:
        if (!gpu_state.lights.length)
            return;

        const light_positions_flattened = [], light_colors_flattened = [];
        for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
            light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
            light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
        }
        gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
        gl.uniform4fv(gpu.light_colors, light_colors_flattened);
        gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
        // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
        // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
        // program (which we call the "Program_State").  Send both a material and a program state to the shaders
        // within this function, one data field at a time, to fully initialize the shader for a draw.

        // Fill in any missing fields in the Material object with custom defaults for this shader:
        const defaults = {color: color(0, 0, 0, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40};
        material = Object.assign({}, defaults, material);

        this.send_material(context, gpu_addresses, material);
        this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
    }
}

class Ring_Shader extends Shader {
    update_GPU(context, gpu_addresses, graphics_state, model_transform, material) {
        // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
        const [P, C, M] = [graphics_state.projection_transform, graphics_state.camera_inverse, model_transform],
            PCM = P.times(C).times(M);
        context.uniformMatrix4fv(gpu_addresses.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false,
            Matrix.flatten_2D_to_1D(PCM.transposed()));
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return `
        precision mediump float;
        varying vec4 point_position;
        varying vec4 center;
        `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        attribute vec3 position;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
        
        void main(){
          gl_Position = projection_camera_model_transform * vec4(position, 1.0);
          point_position = model_transform * vec4(position, 1.0);
          center = model_transform * vec4(0.0, 0.0, 0.0, 1.0);
        }`;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        void main(){
          float r = distance(center, point_position);
          gl_FragColor = vec4 (0.71 * sin(5.3 * 3.14 * r), 0.39 * sin(5.3 * 3.14 * r), 0.11 * sin(5.3 * 3.14 * r), 1.0);
        }`;
    }
}