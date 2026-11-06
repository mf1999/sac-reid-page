# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML, CSS and JavaScript. No framework, no build step. Deploy target: GitHub Pages.

## Users

Re-identification and computer vision researchers. They evaluate whether the dataset fits their work, request access on Zenodo, and cite it in a paper.

## Product Purpose

The project page of the dataset "Saint Anthony's Channel ReID v1.0". It tells a researcher what the dataset contains, shows real crops, explains the evaluation protocol, and sends the researcher to the restricted Zenodo record. Success: a researcher understands the dataset, requests access, and cites it correctly.

## Positioning

Vessel re-identification from one fixed camera over a narrow channel near Šibenik, Croatia. The test split comes from hand-annotated ground truth of 59 MOT sequences. The benchmark protocol uses a time gap and a position change, because a standard Market-1501 evaluator gives scores that are too high.

## Capabilities and Constraints

- Sections: overview, statistics, sample gallery, download, license, citation, contact, funding.
- Gallery: `samples.json` with `{file, class, pid}`. Filter by vessel class. A click on a crop shows the other views of the same pid.
- Vessel classes in the gallery come from `vessel_classes/per_identity*.csv` (automatic labels). The release does not contain class labels.
- Gallery exclusions: pid 1207 (masked person), pids 104 and 260 (readable sail numbers).
- Open decisions: Zenodo URL, DOI and release date. Show them as visible placeholders until the user gives values.

## Brand Commitments

- Name: "Saint Anthony's Channel ReID" (Kanal sv. Ante). Version 1.0.
- Author: Matej Fabijanić, University of Zagreb, Faculty of Electrical Engineering and Computing.
- Footage source: Martinska Research Station, Ruđer Bošković Institute.
- License: CC BY-NC 4.0. Commercial use, which includes the training of AI models for a commercial purpose, needs a separate license.
- Contact: matej.fabijanic@fer.hr (or labust@fer.hr).

## Evidence on Hand

- Release docs: `~/github/AnalizaDinamicnihScena/SibenikReID/release_docs/` (README.md, LICENSE.txt, CITATION.cff).
- Crops and `version.json`: `~/github/AnalizaDinamicnihScena/SibenikReID/release/SaintAnthonysChannelReID_v1.0/`.
- No reference results or protocol code on the page yet. Do not invent scores.

## Product Principles

1. Facts from the release docs only. No invented numbers or claims.
2. Real crops are the main evidence of the dataset.
3. The license limits and the access path are clear before the download.
4. The citation is ready to copy.
