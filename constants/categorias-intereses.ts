import type { BotonCategoriaProps } from "../src/components/boton-categoria";

export const categoriasIntereses: (Pick<
        BotonCategoriaProps,
        "nombre" | "icono" | "color" | "fondo"
> & { id: string })[] = [
        {
                id: "cat-playas",
                nombre: "Playas",
                icono: "palm-tree",
                color: "#367B47",
                fondo: "#E4EED7",
        },
        {
                id: "cat-termas",
                nombre: "Termas",
                icono: "hot-tub",
                color: "#32808B",
                fondo: "#E4F1F2",
        },
        {
                id: "cat-museos",
                nombre: "Museos y patrimonio",
                icono: "bank",
                color: "#81549F",
                fondo: "#EEE5F2",
        },
        {
                id: "cat-gastronomia",
                nombre: "Gastronomía",
                icono: "silverware-fork-knife",
                color: "#E49A28",
                fondo: "#FCF0DA",
        },
        {
                id: "cat-naturaleza",
                nombre: "Naturaleza",
                icono: "leaf",
                color: "#59864A",
                fondo: "#E5EFCF",
        },
        {
                id: "cat-alojamiento",
                nombre: "Alojamiento",
                icono: "bed",
                color: "#4A7FA4",
                fondo: "#E2ECF6",
        },
        {
                id: "cat-artesanias",
                nombre: "Artesanías",
                icono: "palette",
                color: "#B36C50",
                fondo: "#F6E7DB",
        },
];
