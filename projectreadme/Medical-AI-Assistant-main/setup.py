from setuptools import setup, find_packages
with open("req.txt") as f :
    requir = f.read().splitlines()

setup(
    name = "medical_assi",
    packages=find_packages(),
    install_requires=requir,
)